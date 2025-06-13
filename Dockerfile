# Sử dụng Python 3.9 làm base image
FROM python:3.9-slim

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Cài đặt các dependencies cần thiết
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    software-properties-common \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements.txt và cài đặt các dependencies Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ code vào container
COPY . .

# Thiết lập biến môi trường
ENV PORT=5000
ENV HOST=0.0.0.0

# Expose port
EXPOSE 5000

# Chạy ứng dụng với Gunicorn
CMD gunicorn --bind $HOST:$PORT app:app --config gunicorn_config.py 