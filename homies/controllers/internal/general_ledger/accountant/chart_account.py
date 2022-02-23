# module
from fastapi import HTTPException
from uuid import uuid4

# homies
from homies.core import db 
# general_ledger
from homies.models.general_ledger.chart_account import ChartAccount 
from homies.schemas.general_ledger.chart_account import ChartAccountCreate, ChartAccountUpdate





""" GET TABLE DATA """

def get_table_data(request: dict):
    with db.session() as session:
        session.begin()
        try:
            # determine records total
            sql = 'SELECT COUNT(chart_account_id) FROM chart_accounts'
            records_total = (session.execute(sql)).scalar()
            records_total = records_total if records_total else 0
            # default statement
            sql = """
                SELECT chart_accounts.account_number,
                  chart_accounts.account_title,
                  account_types.name AS account_type,
                  chart_accounts.description,
                  chart_accounts.status,
                  chart_accounts.chart_account_id
                  FROM chart_accounts
                  INNER JOIN account_types
                  ON chart_accounts.account_type = account_types.account_type_id"""
            # for searching
            if request['search']['value']:
                sql += f""" WHERE account_number LIKE '%{request['search']['value']}%'"""
                sql += f""" OR account_title LIKE '%{request['search']['value']}%'"""
                sql += f""" OR account_type LIKE '%{request['search']['value']}%'"""
            # for ordering
            if request['order']:
                index = request['order'][0]['column']
                sql += f""" ORDER BY {request['columns'][index]['name']} {request['order'][0]['dir']}"""
            else: 
                sql += ' ORDER BY account_number ASC'
            # for pagination
            if request['length'] != -1:
                sql += f""" LIMIT {request['start']}, {request['length']}"""
            # resultset
            resultset = (session.execute(sql)).all()
        except:
            raise HTTPException(status_code=500, detail='Internal Server Error.')
        finally:
            session.close()
    return { 
        'draw': request['draw'],
        'recordsTotal': records_total,
        'recordsFiltered': records_total,
        'data': resultset
    } 





""" CREATE """

def create(request: dict):
    with db.session() as session:
        session.begin()
        try:
            chart_account = (ChartAccountCreate(**request)).dict(exclude_none=True)
            chart_account['chart_account_id'] = uuid4()
            chart_account['account_title'] = chart_account['account_title'].title()
            sql = """
                INSERT INTO chart_accounts(
                  chart_account_id,
                  account_title,
                  account_type,
                  account_number,
                  description,
                  created_by
                ) VALUES(
                  :chart_account_id,
                  :account_title,
                  :account_type,
                  :account_number,
                  :description,
                  :created_by)"""
            session.execute(sql, {**chart_account})
        except:
            session.rollback()
            raise HTTPException(status_code=500, detail='Internal Server Error.')
        else:
            session.commit()
        finally:
            session.close()
    return { 
        'detail': 'Successfully Created.',
        'type': 'success'
    }





""" VALIDATE """

def validate(column: str, value: str, closest: str):
    with db.session() as session:
        session.begin()
        try:
            sql = f"""SELECT {column} FROM chart_accounts WHERE {column} = :value"""
            value = session.execute(sql, {'value': value}).first()
        except:
            raise HTTPException(status_code=500, detail='Internal Server Error.')
        finally:
            session.close()
    return { 
        'detail': (column.capitalize() + ' already exists.') if value else None, 
        'element': column if value else None,
        'closest': closest if value else None
    }





""" GET ONE """

def get_one(chart_account_id: str):
    try:
        session = db.session()
        session.begin()
        chart_account = session.query(ChartAccount).filter(ChartAccount.chart_account_id == chart_account_id).first()
    except:
        session.close()
        raise HTTPException(status_code=500, detail='Internal Server Error.')
    if not chart_account:
        session.close()
        raise HTTPException(status_code=404, detail='Record does`nt exist.')
    return chart_account
        




""" GET ALL """

def get_all():
    with db.session() as session:
        session.begin()
        try:
            sql = """
                SELECT CONCAT(chart_account_id, '&', CAST(account_number AS CHAR)) AS id,
                  account_title AS text
                  FROM chart_accounts
                  WHERE status = 'Active'
                  ORDER BY account_number ASC"""
            chart_accounts = session.execute(sql).all()
        except:
            raise HTTPException(status_code=500, detail='Internal Server Error.')
        finally:
            session.close()
    return chart_accounts





""" UPDATE """

def update(chart_account_id: str, chart_account: dict):
    with db.session() as session:
        session.begin()
        try:
            chart_account = (ChartAccountUpdate(**chart_account)).dict(exclude_none=True)
            chart_account['account_title'] = chart_account['account_title'].title()
            sql = """
                UPDATE chart_accounts
                  SET account_title = :account_title,
                    account_type = :account_type,
                    account_number = :account_number,
                    description = :description,
                    updated_by = :updated_by
                  WHERE chart_account_id = :chart_account_id"""
            success = session.execute(sql, { 
                **chart_account, 
                'chart_account_id': chart_account_id
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
        'detail': 'Successfully Updated.',
        'type': 'success'
    }
    




""" DEACTIVATE / ACTIVATE """

def de_activate(chart_account_id: str, operation_type: int, current_user: str):
    with db.session() as session:
        session.begin()
        try:
            status = 'Inactive' if operation_type == 0 else 'Active'
            sql = """
                UPDATE chart_accounts 
                  SET status = :status,
                    updated_by = :updated_by
                WHERE chart_account_id = :chart_account_id"""
            success = session.execute(sql, {
                'status': status,
                'updated_by': current_user,
                'chart_account_id': chart_account_id
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
        'detail': ('Successfully Deactivated.' if operation_type == 0 else 'Successfully Activated.'),
        'type': ('info' if operation_type == 0 else 'success')
    }
   