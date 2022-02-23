# module
from fastapi import HTTPException
from sqlalchemy import and_
from uuid import uuid4
from datetime import datetime

# homies
from homies.core import db 
# general_ledger
from homies.models.general_ledger.journal_entry import JournalEntry





""" GET TABLE DATA """

def get_table_data(data: dict):
    with db.session() as session:
        session.begin()
        try:
            # Determine records total
            sql = f"""
                SELECT COUNT(id) 
                  FROM journal_entries"""
            if data['search']['value']:
                sql += f""" WHERE date LIKE '%{data['search']['value']}%'"""
            else:
                sql += f""" WHERE date LIKE '%{data['period']}%'"""
            sql += f""" AND status = '{data['status']}'
                AND entry_type = '{data['type']}'"""
            records_total = (session.execute(sql)).scalar()
            records_total = records_total if records_total else 0
            # Default statement
            sql = f"""
                SELECT JE.id AS entry,
                  JE.date,
                  JE.explanation,
                  JE.adjustable,
                  JE.status,
                  JE.entry_type,
                  JE.originating_entry,
                  CA.account_title,
                  JA.pr,
                  JA.debit,
                  JA.credit
                  FROM journal_entries AS JE
                  INNER JOIN journal_accounts AS JA
                    ON JE.id = JA.journal_entry
                  INNER JOIN chart_accounts AS CA
                    ON JA.account_title = CA.chart_account_id"""
            # For searching
            if data['search']['value']:
                sql += f""" WHERE (JE.date LIKE '%{data['search']['value']}%' 
                    OR CA.account_title LIKE '%{data['search']['value']}%')"""
            else:
                sql += f""" WHERE JE.date LIKE '%{data['period']}%'"""
            sql += f""" AND JE.status = '{data['status']}'
                AND JE.entry_type = '{data['type']}'"""
            # For ordering
            if data['order']:
                index = data['order'][0]['column']
                sql += f""" ORDER BY {data['columns'][index]['name']} {data['order'][0]['dir']}, JE.journalized_at ASC, entry, JA.debit DESC, JA.credit DESC"""
            else: 
                sql += ' ORDER BY JE.date ASC, JE.journalized_at ASC, entry, JA.debit DESC, JA.credit DESC'
            # For pagination
            if data['length'] != -1:
                sql += f""" LIMIT {data['start']}, {data['length']}"""
            # Resultset
            resultset = (session.execute(sql)).all()
        except:
            raise HTTPException(status_code=500, detail='Internal Server Error.')
        finally:
            session.close()
    return { 
        'draw': data['draw'],
        'recordsTotal': records_total,
        'recordsFiltered': records_total,
        'data': resultset
    } 





""" CREATE """

def create(data: dict, user: str):
    with db.session() as session:
        session.begin()
        try:
            # For adjusting entry w/ originating entry
            if data['entry_type'] == 'Adjusting' and data['originating_entry'] != None:
                # Update the balance of originating entry
                sql = """
                    UPDATE journal_entries
                        SET balance = :balance,
                        adjustable = :adjustable
                        WHERE id = :originating_entry"""
                session.execute(sql, {
                    'balance': (data['balance'] if data['balance'] > 0 else 0),
                    'adjustable': (1 if data['balance'] > 0 else 0),
                    'originating_entry': data['originating_entry']
                })
                data['balance'] = data['adjusted_balance']
                del data['adjusted_balance']
            # Create journal_entries
            id = uuid4()
            sql = """
                INSERT INTO journal_entries(
                  id,
                  date,
                  explanation,
                  adjustable,
                  method,
                  balance,
                  status,
                  entry_type,
                  originating_entry,
                  journalized_by,
                  posted_at,
                  posted_by
                ) VALUES(
                  :id,
                  :date,
                  :explanation,
                  :adjustable,
                  :method,
                  :balance,
                  :status,
                  :entry_type,
                  :originating_entry,
                  :journalized_by,
                  :posted_at,
                  :posted_by)"""
            data['id'] = id
            data['journalized_by'] = user
            data['posted_at'] = (datetime.now() if data['status'] == 'Posted' else None)
            data['posted_by'] = (user if data['status'] == 'Posted' else None)
            session.execute(sql, data)
            # Create journal_accounts
            for account in data['new_accounts']:
                account['id'] = uuid4()
                account['journal_entry'] = id
                sql = """
                    INSERT INTO journal_accounts(
                      id,
                      account_title,
                      pr,
                      debit,
                      credit,
                      journal_entry
                    ) VALUES(
                      :id,
                      :account_title,
                      :pr,
                      :debit,
                      :credit,
                      :journal_entry)"""
                session.execute(sql, account)
        except:
            session.rollback()
            raise HTTPException(status_code=500, detail='Internal Server Error.')
        else:
            session.commit()
        finally:
            session.close()
    return { 
        'detail': 'New entry has been ' + ('journalized.' if data['entry_type'] == 'Initial' else 'adjusted.'),
        'type': 'success'
    }





""" VALIDATE """

def validate(originating_entry: str):
    with db.session() as session:
        session.begin()
        try:
            sql = f"""
                SELECT 1 
                  FROM journal_entries 
                  WHERE id = :id
                    AND status = 'Posted'"""
            postable = session.execute(sql, {'id': originating_entry}).first()
        except:
            raise HTTPException(status_code=500, detail='Internal Server Error.')
        finally:
            session.close()
    return { 
        'detail': None if postable else 'Unable to post the entry, its originating entry is not posted.', 
        'type': None if postable else 'info'
    }





""" GET ONE """

def get_one(id: str):
    try:
        session = db.session()
        session.begin()
        journal_entry = session.query(JournalEntry).filter(JournalEntry.id == id).first()
    except:
        session.close()
        raise HTTPException(status_code=500, detail='Internal Server Error.')
    if not journal_entry:
        session.close()
        raise HTTPException(status_code=404, detail='Record doesn`t exist.')
    return journal_entry





""" GET ALL """

def get_all(period: str, adjustable):
    with db.session() as session:
        session.begin()
        try:
            sql = f"""
                SELECT JE.id,
                  CONCAT('JE-', JE.date) AS text
                  FROM journal_entries AS JE
                  WHERE JE.date LIKE '%{period}%'"""
            if adjustable:
                sql += f""" 
                      AND JE.adjustable = 1
                      AND JE.status = 'Posted'
                      AND NOT EXISTS (
                          SELECT 1
                            FROM journal_entries AS AE
                            WHERE AE.originating_entry = JE.id
                              AND AE.date LIKE '%{period}%'
                      )"""
            else: 
                sql += f""" AND JE.status = 'Journalized'""" 
            sql += """ ORDER BY JE.date ASC"""
            journal_entries = session.execute(sql).all()
        except:
            raise HTTPException(status_code=500, detail='Internal Server Error.')
        finally:
            session.close()
    return journal_entries




    
""" UPDATE """

def update(id: str, data: dict, user: str):
    with db.session() as session:
        session.begin()
        try:
            # For adjusting entry w/ originating entry
            if data['entry_type'] == 'Adjusting' and data['originating_entry'] != None:
                # Update the balance of originating entry
                sql = """
                    UPDATE journal_entries
                        SET balance = :balance,
                        adjustable = :adjustable
                        WHERE id = :originating_entry"""
                session.execute(sql, {
                    'balance': (data['balance'] if data['balance'] > 0 else 0),
                    'adjustable': (1 if data['balance'] > 0 else 0),
                    'originating_entry': data['originating_entry']
                })
                data['balance'] = data['adjusted_balance']
            # Update journal_entries
            sql = """
                UPDATE journal_entries
                  SET posted_at = :posted_at,
                    posted_by = :posted_by
                  WHERE id = :id"""
            params = {'id': id}
            if data['status'] == 'Posted':
                sql += """ AND status != 'Posted'"""
                params['posted_at'] = datetime.now()
                params['posted_by'] = user
            else:
                sql += """ AND status = 'Posted'"""
                params['posted_at'] = None
                params['posted_by'] = None
            session.execute(sql, params)
            sql = """
                UPDATE journal_entries
                  SET date = :date,
                    explanation = :explanation,
                    adjustable = :adjustable,
                    method = :method,
                    balance = :balance,
                    status = :status,
                    entry_type = :entry_type,
                    originating_entry = :originating_entry,
                    updated_by = :updated_by
                  WHERE id = :id"""
            success = session.execute(sql, { 
                'date': data['date'], 
                'explanation': data['explanation'],
                'adjustable': data['adjustable'],
                'method': data['method'],
                'balance': data['balance'],
                'status': data['status'],
                'entry_type': data['entry_type'],
                'originating_entry': data['originating_entry'],
                'updated_by': user,
                'id': id
            }).rowcount
            # Create journal_accounts
            for account in data['new_accounts']:
                account['id'] = uuid4()
                account['journal_entry'] = id
                sql = """
                    INSERT INTO journal_accounts(
                      id,
                      account_title,
                      pr,
                      debit,
                      credit,
                      journal_entry
                    ) VALUES(
                      :id,
                      :account_title,
                      :pr,
                      :debit,
                      :credit,
                      :journal_entry)"""
                session.execute(sql, account)
            # Update journal_accounts
            for account in data['updated_accounts']:
                debit_or_credit = 'debit' if float(account['debit']) > 0 else 'credit'
                sql = f"""
                    UPDATE journal_accounts
                      SET debit = :debit,
                        credit = :credit
                      WHERE account_title = :account_title
                        AND {debit_or_credit} > 0
                        AND journal_entry = :journal_entry"""
                session.execute(sql, { 
                    'debit': account['debit'],
                    'credit': account['credit'], 
                    'account_title': account['account_title'],
                    'journal_entry': id
                })
            # Delete old journal_accounts
            for account_id in data['accounts_to_delete']:
                (account_title, debit_or_credit) = account_id.split('&')
                sql = f"""
                    DELETE FROM journal_accounts
                      WHERE account_title = :account_title
                        AND {debit_or_credit.lower()} > 0
                        AND journal_entry = :journal_entry"""
                session.execute(sql, {
                    'account_title': account_title,
                    'journal_entry': id
                })
            # Delete adjusting entries
            if data['entry_type'] == 'Initial':
                sql = """ 
                    DELETE FROM journal_accounts
                      WHERE journal_entry = (
                        SELECT id FROM journal_entries
                          WHERE originating_entry = :originating_entry
                      )"""
                session.execute(sql, {
                    'originating_entry': id
                })
                sql = """ 
                    DELETE FROM journal_entries
                      WHERE originating_entry = :originating_entry"""
                session.execute(sql, {
                    'originating_entry': id
                })
        except: 
            session.rollback()
            session.close()
            raise HTTPException(status_code=500, detail='Internal Server Error.')
        if not success:
            session.rollback()
            session.close()
            raise HTTPException(status_code=404, detail='Record doesn`t exist.')
        else:
            session.commit()
    return { 
        'detail': 'Successfully Updated.',
        'type': 'success'
    }





""" DEACTIVATE / ACTIVATE """

def de_activate(id: str, operation_type: int, user: str):
    with db.session() as session:
        session.begin()
        try:
            if operation_type == 0:
                status = 'Inactive'
                detail = 'Successfully Deactivated.'
            elif operation_type == 1:
                status = 'Journalized'
                detail = 'Successfully Activated.'
            elif operation_type == 2:
                status = 'Journalized'
                detail = 'Successfully Unposted.'
            elif operation_type == 3:
                status = 'Posted'
                detail = 'Successfully Posted.'
            if operation_type == 4:
                detail = 'Successfully Removed.'
                # Update the balance of originating entry w/ method != NULL
                sql = """
                    UPDATE journal_entries AS JE
                      SET JE.balance = JE.balance + IFNULL((
                        SELECT AE.balance 
                          FROM journal_entries AS AE
                          WHERE AE.id = :id
                      ), 0)
                      WHERE JE.id = (
                        SELECT AE.originating_entry
                          FROM journal_entries AS AE
                          WHERE AE.id = :id
                      )
                        AND JE.method IS NOT NULL"""
                success = session.execute(sql, {'id': id})
                if not success:
                    # Update the balance of originating entry w/ method == NULL
                    sql = """
                        UPDATE journal_entries AS JE
                          SET JE.balance = JE.balance - IFNULL((
                            SELECT AE.balance 
                              FROM journal_entries AS AE
                              WHERE AE.id = :id
                          ), 0)
                          WHERE JE.id = (
                            SELECT AE.originating_entry
                              FROM journal_entries AS AE
                              WHERE AE.id = :id
                          )
                            AND JE.method IS NULL"""
                    session.execute(sql, {'id': id})
                # Remove adjustments
                sql = """
                    DELETE FROM journal_accounts
                      WHERE journal_entry = (
                          SELECT id FROM journal_entries
                            WHERE originating_entry = :originating_entry
                      )"""
                session.execute(sql, {'originating_entry': id})
                sql = """
                    DELETE FROM journal_entries
                      WHERE originating_entry = :originating_entry"""
                session.execute(sql, {'originating_entry': id})
                # Remove entry
                sql = """ 
                    DELETE FROM journal_accounts 
                      WHERE journal_entry = :id"""
                session.execute(sql, {'id': id})
                sql = """
                    DELETE FROM journal_entries
                      WHERE id = :id"""
                success = session.execute(sql, {'id': id}).rowcount
            else:
                # Update status
                sql = """
                    UPDATE journal_entries 
                      SET status = :status,
                        updated_by = :updated_by,
                        posted_at = :posted_at,
                        posted_by = :posted_by
                      WHERE id = :id"""
                success = session.execute(sql, {
                    'status': status,
                    'updated_by': user,
                    'posted_at': (datetime.now() if status == 'Posted' else None),
                    'posted_by': (user if status == 'Posted' else None),
                    'id': id
                }).rowcount
        except:
            session.rollback()
            session.close()
            raise HTTPException(status_code=500, detail='Internal Server Error.')
        if not success:
            session.rollback()
            session.close()
            raise HTTPException(status_code=404, detail='Record doesn`t exist.')
        else:
            session.commit()
    return { 
        'detail': detail,
        'type': ('success' if (operation_type == 1 or operation_type == 3) else 'info')
    }
   




