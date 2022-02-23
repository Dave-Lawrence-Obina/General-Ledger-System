# module
from fastapi import UploadFile, HTTPException
from secrets import token_hex

async def read_image(pic: UploadFile, filename: str, destination: str):
    FILE_PATH = "static/images/"+destination

    extension = filename.split('.')[1]
    if extension.lower() not in ['png','jpg','jpeg','gif']:
        raise HTTPException(status_code=415, detail='Unsupported Media Type.')

    # generated name
    token_name = token_hex(10) + '.' + extension
    generated_name = FILE_PATH + token_name

    # read image
    try:
        file_content = await pic.read()
        return (generated_name, file_content)
    except:
        raise HTTPException(status_code=500, detail='Internal Server Error.')

    