import os
from uuid import uuid4
from fastapi import UploadFile

async def save_file(file: UploadFile) -> str:
    UPLOAD_DIR = "uploads"
    
    # Tạo tên file unique để tránh trùng
    ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    # Lưu file
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    return file_path