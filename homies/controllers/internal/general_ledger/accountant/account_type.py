# module
from fastapi import HTTPException
from uuid import uuid4

# homies
from homies.core import db 
# general_ledger
from homies.models.general_ledger.account_type import AccountType 
from homies.schemas.general_ledger.account_type import AccountTypeCreate, AccountTypeUpdate





""" GET TABLE DATA """

def get_table_data(request: dict):
    with db.session() as session:
        session.begin()
        try:
            # determine records total
            sql = 'SELECT COUNT(account_type_id) FROM account_types'
            records_total = (session.execute(sql)).scalar()
            records_total = records_total if records_total else 0
            # default statement
            sql = 'SELECT * FROM account_types'
            # for searching
            if request['search']['value']:
                sql += f""" WHERE name LIKE '%{request['search']['value']}%'"""
                sql += f""" OR code LIKE '%{request['search']['value']}%'"""
            # for ordering
            if request['order']:
                index = request['order'][0]['column']
                sql += f""" ORDER BY {request['columns'][index]['name']} {request['order'][0]['dir']}"""
            else: 
                sql += ' ORDER BY name ASC'
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
            account_type = (AccountTypeCreate(**request)).dict(exclude_none=True)
            account_type['account_type_id'] = uuid4()
            account_type['name'] = account_type['name'].title()
            sql = """
                INSERT INTO account_types(
                  account_type_id,
                  name,
                  code,
                  description,
                  created_by
                ) VALUES(
                  :account_type_id,
                  :name,
                  :code,
                  :description,
                  :created_by)"""
            session.execute(sql, {**account_type})
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
            sql = f"""SELECT {column} FROM account_types WHERE {column} = :value"""
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

def get_one(account_type_id: str):
    try:
        session = db.session()
        session.begin()
        account_type = session.query(AccountType).filter(AccountType.account_type_id == account_type_id).first()
    except:
        session.close()
        raise HTTPException(status_code=500, detail='Internal Server Error.')
    if not account_type:
        session.close()
        raise HTTPException(status_code=404, detail='Record doesn`t exist.')
    return account_type
        




""" GET ALL """

def get_all():
    with db.session() as session:
        session.begin()
        try:
            sql = """
                SELECT account_type_id AS id,
                  name AS text,
                  code
                  FROM account_types
                  ORDER BY created_at ASC"""
            account_types = session.execute(sql).all()
        except:
            raise HTTPException(status_code=500, detail='Internal Server Error.')
        finally:
            session.close()
    return account_types





""" UPDATE """

def update(account_type_id: str, account_type: dict):
    with db.session() as session:
        session.begin()
        try:
            account_type = (AccountTypeUpdate(**account_type)).dict(exclude_none=True)
            account_type['name'] = account_type['name'].title()
            sql = """
                UPDATE account_types
                  SET name = :name,
                    code = :code,
                    description = :description,
                    updated_by = :updated_by
                  WHERE account_type_id = :account_type_id"""
            success = session.execute(sql, { 
                **account_type, 
                'account_type_id': account_type_id
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

def de_activate(account_type_id: str, operation_type: int, current_user: str):
    with db.session() as session:
        session.begin()
        try:
            status = 'Inactive' if operation_type == 0 else 'Active'
            sql = """
                UPDATE account_types 
                  SET status = :status,
                    updated_by = :updated_by
                WHERE account_type_id = :account_type_id"""
            success = session.execute(sql, {
                'status': status,
                'updated_by': current_user,
                'account_type_id': account_type_id
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
   