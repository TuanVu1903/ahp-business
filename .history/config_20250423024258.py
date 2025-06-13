import os

# Cấu hình MongoDB Atlas - đặt trực tiếp thay vì đọc từ .env
MONGO_URI = 'mongodb+srv://1050070053:Tuanvu1903.@ahp.lqgxl3j.mongodb.net/?retryWrites=true&w=majority&appName=AHP'
MONGO_DB_NAME = 'AHP'

# Cấu hình bảo mật - đặt một secret key mạnh
SECRET_KEY = 'af56b4d9e5b3a8f7c1d2e3f4a5b6c7d8'  # Chuỗi ngẫu nhiên

# Cấu hình ứng dụng
DEBUG = True
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max upload size 