# AHP Business Decision Support System

Hệ thống hỗ trợ ra quyết định trong kinh doanh sử dụng phương pháp phân tích thứ bậc (AHP - Analytic Hierarchy Process). Dự án này giúp người dùng đánh giá và so sánh các lựa chọn dựa trên nhiều tiêu chí khác nhau một cách khoa học và hiệu quả.

## Tính năng chính

- **Phân tích AHP đầy đủ**
  - Tạo và quản lý các tiêu chí đánh giá
  - So sánh cặp giữa các tiêu chí
  - So sánh cặp giữa các phương án theo từng tiêu chí
  - Tính toán trọng số và độ nhất quán (CR)
  - Tổng hợp kết quả và đưa ra quyết định cuối cùng

- **Trực quan hóa dữ liệu**
  - Biểu đồ so sánh trọng số các tiêu chí
  - Biểu đồ so sánh điểm số các phương án
  - Ma trận so sánh cặp trực quan

- **Quản lý dữ liệu**
  - Nhập dữ liệu từ file Excel
  - Xuất kết quả ra file Excel và PDF
  - Lưu trữ lịch sử phân tích trên MongoDB

- **Giao diện người dùng**
  - Thiết kế hiện đại, dễ sử dụng
  - Responsive trên các thiết bị
  - Hướng dẫn chi tiết trong quá trình sử dụng

## Yêu cầu hệ thống

- Python (phiên bản được khuyến nghị: 3.10+)
- MongoDB để lưu trữ dữ liệu
- Các thư viện Python được liệt kê trong `requirements.txt`

## Cài đặt và chạy local

1. Clone repository:
```bash
git clone https://github.com/TuanVu1903/ahp-business.git
cd ahp-business
```

2. Tạo và kích hoạt môi trường ảo:
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python -m venv venv
source venv/bin/activate
```

3. Cài đặt các dependencies:
```bash
pip install -r requirements.txt
```

4. Thiết lập biến môi trường:
- Tạo file `.env` trong thư mục gốc với nội dung:
```
MONGODB_URI=your_mongodb_connection_string
PORT=8000
```

5. Chạy ứng dụng:
```bash
python app.py
```

## Deploy lên Render.com

1. Fork repository này về tài khoản GitHub của bạn

2. Tạo tài khoản trên [Render.com](https://render.com)

3. Tạo Web Service mới:
   - Kết nối với GitHub repository
   - Chọn nhánh main
   - Chọn Runtime: Python
   - Thêm biến môi trường:
     - `MONGODB_URI`: Connection string MongoDB Atlas
     - `PORT`: 8000

4. Deploy và truy cập ứng dụng theo URL được cung cấp

## Cấu trúc dự án

```
ahp-business/
├── app.py              # File chính của ứng dụng
├── templates/          # Thư mục chứa các template HTML
├── static/            # Thư mục chứa các file tĩnh (CSS, JS, images)
├── requirements.txt   # Danh sách các dependency
├── gunicorn_config.py # Cấu hình cho Gunicorn
└── render.yaml        # Cấu hình cho Render.com
```

## Hướng dẫn sử dụng

1. **Tạo phân tích mới**
   - Nhập tên dự án và mô tả
   - Thêm các tiêu chí đánh giá
   - Thêm các phương án cần so sánh

2. **So sánh các tiêu chí**
   - Thực hiện so sánh cặp giữa các tiêu chí
   - Hệ thống sẽ tính toán trọng số và kiểm tra độ nhất quán

3. **So sánh các phương án**
   - Với mỗi tiêu chí, so sánh cặp giữa các phương án
   - Hệ thống sẽ tính toán điểm số cho từng phương án

4. **Xem kết quả**
   - Xem tổng hợp kết quả và biểu đồ
   - Xuất kết quả ra file Excel hoặc PDF
   - Lưu kết quả vào cơ sở dữ liệu

## Đóng góp

Mọi đóng góp đều được hoan nghênh! Vui lòng:
1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## Giấy phép

Dự án này được phân phối dưới giấy phép MIT. Xem `LICENSE` để biết thêm thông tin.

## Liên hệ

Nếu bạn có bất kỳ câu hỏi hoặc góp ý nào, vui lòng tạo issue trong repository hoặc liên hệ trực tiếp với chúng tôi.
