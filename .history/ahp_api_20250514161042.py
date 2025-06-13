from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import openai  # hoặc API LLM khác mà bạn đang sử dụng

app = FastAPI(
    title="AHP Suggestion API",
    description="API for getting AHP criteria and alternatives suggestions",
    version="1.0.0"
)

# Cấu hình CORS để frontend có thể gọi API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Trong production nên giới hạn domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AHPSuggestionResponse(BaseModel):
    criteria: List[str]
    alternatives: List[str]

@app.post("/api/get-suggestions", response_model=AHPSuggestionResponse)
async def get_suggestions(
    goal: str = Form(...),
    file: Optional[UploadFile] = None
):
    """
    Lấy gợi ý về tiêu chí và phương án từ LLM dựa trên mục tiêu và file (nếu có)
    """
    try:
        # Xây dựng prompt cho LLM
        prompt = f"""
        Mục tiêu: {goal}
        
        Hãy đề xuất các tiêu chí đánh giá và các phương án cho bài toán AHP này.
        Yêu cầu:
        1. 3-7 tiêu chí đánh giá
        2. 2-5 phương án
        3. Các tiêu chí và phương án phải phù hợp với mục tiêu
        
        Trả về dưới dạng JSON với format:
        {{
            "criteria": ["tiêu chí 1", "tiêu chí 2", ...],
            "alternatives": ["phương án 1", "phương án 2", ...]
        }}
        """

        # Nếu có file, đọc nội dung và thêm vào prompt
        if file:
            file_content = await file.read()
            file_text = file_content.decode()
            prompt += f"\n\nThông tin thêm từ file:\n{file_text}"

        # Gọi LLM API (ví dụ với OpenAI)
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Bạn là chuyên gia về phương pháp AHP"},
                {"role": "user", "content": prompt}
            ]
        )

        # Parse kết quả từ LLM
        suggestion = response.choices[0].message.content
        # Xử lý và validate kết quả ở đây

        return AHPSuggestionResponse(
            criteria=["Giá cả", "Chất lượng", "Thời gian"],  # Thay bằng kết quả thực từ LLM
            alternatives=["Phương án A", "Phương án B"]  # Thay bằng kết quả thực từ LLM
        )

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 