<<<<<<< HEAD
# ahpbussiness
=======
# Decision Pro - Hệ thống hỗ trợ ra quyết định chuyên nghiệp

Decision Pro là một ứng dụng web hiện đại giúp người dùng ra quyết định chuyên nghiệp dựa trên phương pháp phân tích thứ bậc AHP (Analytic Hierarchy Process). Ứng dụng hỗ trợ việc so sánh, đánh giá các phương án dựa trên nhiều tiêu chí khác nhau, và cung cấp kết quả phân tích trực quan.

## Tính năng chính

- **Giao diện người dùng hiện đại**: Trải nghiệm người dùng trực quan và chuyên nghiệp
- **Phân tích AHP đầy đủ**: Hỗ trợ so sánh cặp giữa các tiêu chí và phương án
- **Đề xuất thông minh với AI**: Tự động đề xuất tiêu chí và phương án phù hợp với mục tiêu
- **Kiểm tra độ nhất quán**: Đảm bảo kết quả đánh giá có độ tin cậy cao
- **Lưu trữ dự án**: Lưu và quản lý nhiều dự án phân tích AHP với PostgreSQL
- **Xuất kết quả**: Hỗ trợ xuất kết quả dưới dạng Excel và PDF
- **Trực quan hóa dữ liệu**: Biểu đồ trực quan hiển thị kết quả phân tích

## Yêu cầu hệ thống

- Python 3.8+
- PostgreSQL 13+
- Kết nối internet (cho tính năng AI)

## Cài đặt

### 1. Clone repository

```bash
git clone https://github.com/yourusername/decision-pro.git
cd decision-pro
```

### 2. Tạo và kích hoạt môi trường ảo

```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# macOS/Linux
python -m venv .venv
source .venv/bin/activate
```

### 3. Cài đặt các thư viện cần thiết

```bash
pip install -r requirements.txt
```

### 4. Cấu hình cơ sở dữ liệu PostgreSQL

- Cài đặt và khởi động PostgreSQL
- Tạo cơ sở dữ liệu mới: `ahp_decision`
- Tạo file `.env` từ file mẫu `.env.example` và cấu hình thông tin kết nối:

```
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ahp_decision
```

### 5. Khởi động ứng dụng

```bash
python app.py
```

Sau khi khởi động, ứng dụng sẽ tự động tạo các bảng cần thiết trong cơ sở dữ liệu PostgreSQL. Truy cập ứng dụng tại địa chỉ: http://localhost:5000

## Hướng dẫn sử dụng

1. **Xác định mục tiêu**: Nhập mục tiêu cần ra quyết định (ví dụ: "Chọn nhà cung cấp tốt nhất")
2. **Thiết lập tiêu chí và phương án**: Thêm các tiêu chí đánh giá và các phương án lựa chọn
3. **So sánh tiêu chí**: Đánh giá tầm quan trọng tương đối giữa các tiêu chí
4. **So sánh phương án**: Đánh giá các phương án theo từng tiêu chí
5. **Xem kết quả phân tích**: Xem kết quả phân tích, điểm số, và biểu đồ trực quan
6. **Xuất kết quả**: Xuất kết quả dưới dạng Excel hoặc PDF

## Tích hợp AI

Ứng dụng hỗ trợ tích hợp với LLM để đề xuất tiêu chí và phương án phù hợp. Để sử dụng tính năng này, cấu hình API_URL trong file `.env`:

```
API_URL=http://localhost:1234/v1/chat/completions
```

## Đóng góp

Mọi đóng góp đều được đánh giá cao! Vui lòng mở issue hoặc gửi pull request để cải thiện ứng dụng.

## Giấy phép

[MIT License](LICENSE) 
>>>>>>> d4c687e (Initial commit)
