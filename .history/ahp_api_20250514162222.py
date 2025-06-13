from fastapi import FastAPI, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import os
import json
import requests

# Cấu hình API URL từ environment variable
API_URL = os.getenv('API_URL', "http://localhost:1234/v1/chat/completions")

app = FastAPI(
    title="AHP Suggestion API",
    description="API for getting AHP criteria and alternatives suggestions",
    version="1.0.0"
)

# Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AHPSuggestionResponse(BaseModel):
    criteria: List[str]
    alternatives: List[str]

async def call_llm_api(prompt: str) -> dict:
    """
    Gọi LM Studio API và xử lý response
    """
    headers = {
        "Content-Type": "application/json"
    }
    
    data = {
        "messages": [
            {"role": "system", "content": "Bạn là chuyên gia về phương pháp AHP. Hãy trả lời theo đúng format JSON được yêu cầu."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 2000
    }

    try:
        response = requests.post(API_URL, headers=headers, json=data)
        response.raise_for_status()  # Raise exception for non-200 status codes
        
        result = response.json()
        content = result['choices'][0]['message']['content']
        
        # Tìm và parse phần JSON từ response
        try:
            # Tìm đoạn JSON trong response
            start_idx = content.find('{')
            end_idx = content.rfind('}') + 1
            if start_idx != -1 and end_idx != -1:
                json_str = content[start_idx:end_idx]
                return json.loads(json_str)
            else:
                raise ValueError("Không tìm thấy JSON trong response")
        except json.JSONDecodeError:
            raise ValueError("Không thể parse JSON từ response")

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi gọi LLM API: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý response: {str(e)}")

@app.post("/api/get-suggestions", response_model=AHPSuggestionResponse)
async def get_suggestions(
    goal: str = Form(...),
    file: Optional[UploadFile] = None
):
    """
    Lấy gợi ý về tiêu chí và phương án từ LLM dựa trên mục tiêu và file (nếu có)
    """
    try:
        # Xây dựng prompt
        prompt = f"""
        Mục tiêu: {goal}
        
        Hãy đề xuất các tiêu chí đánh giá và các phương án cho bài toán AHP này.
        Yêu cầu:
        1. 3-7 tiêu chí đánh giá
        2. 2-5 phương án
        3. Các tiêu chí và phương án phải phù hợp với mục tiêu
        
        QUAN TRỌNG: Chỉ trả về dưới dạng JSON với format sau, không thêm bất kỳ text nào khác:
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

        # Gọi LLM API và lấy kết quả
        result = await call_llm_api(prompt)
        
        # Validate kết quả
        if not isinstance(result, dict):
            raise ValueError("Response không đúng format")
        
        criteria = result.get('criteria', [])
        alternatives = result.get('alternatives', [])
        
        if not criteria or not alternatives:
            raise ValueError("Thiếu tiêu chí hoặc phương án trong response")
            
        if not (3 <= len(criteria) <= 7):
            raise ValueError("Số lượng tiêu chí không hợp lệ (phải từ 3-7)")
            
        if not (2 <= len(alternatives) <= 5):
            raise ValueError("Số lượng phương án không hợp lệ (phải từ 2-5)")

        return AHPSuggestionResponse(
            criteria=criteria,
            alternatives=alternatives
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 