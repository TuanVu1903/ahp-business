from pymongo import MongoClient
from datetime import datetime
import json

# Kết nối MongoDB (localhost mặc định)
client = MongoClient("mongodb://localhost:27017/")
db = client["ahp"]
collection = db["logs"]

# Dữ liệu log cần ghi
log_entry = {
    "timestamp": datetime.utcnow().isoformat() + "Z",
    "user_id": "khoa123",
    "action": "AHP_MATRIX_SUBMITTED",
    "goal": "Chọn điện thoại phù hợp nhất",
    "criteria": ["Price", "Storage", "Camera", "Look"],
    "alternatives": ["Mobile 1", "Mobile 2", "Mobile 3"],
    "criteria_matrix": [
        [1, 5, 3, 7],
        [0.2, 1, 0.5, 3],
        [0.333, 2, 1, 5],
        [0.143, 0.333, 0.2, 1]
    ],
    "alternative_matrices": {
        "Price": [[1, 3, 4], [1/3, 1, 2], [1/4, 0.5, 1]],
        "Storage": [[1, 1/3, 3], [3, 1, 5], [1/3, 0.2, 1]],
        "Camera": [[1, 2, 0.333], [0.5, 1, 0.2], [3, 5, 1]],
        "Look": [[1, 5, 2], [0.2, 1, 0.333], [0.5, 3, 1]]
    },
    "final_scores": {
        "Mobile 1": 0.5223,
        "Mobile 2": 0.2772,
        "Mobile 3": 0.2005
    },
    "selected": "Mobile 1"
}

# Ghi log vào MongoDB
result = collection.insert_one(log_entry)
print(f"Đã ghi log với ID: {result.inserted_id}")
