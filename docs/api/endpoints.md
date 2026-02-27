# Senlyzer API Documentation

## 🩺 Clinical Sessions

### POST `/api/bookings`
Khởi tạo một phiên khám mới.
- **Request Body:** `{ "user_id": "uuid", "doctor_id": "uuid" }`
- **Response:** `{ "id": "uuid", "status": "in_progress" }`

### POST `/api/medical-records`
Lưu kết quả khám và dữ liệu đối soát AI.
- **Request Body:** `{ "booking_id": "...", "subjective": "...", "objective": "...", "assessment": "...", "plan": "...", "diagnosis": "...", "icd_codes": "...", "ai_results": {...}, "match_score": 0.95 }`
- **Response:** `{ "success": true }`

## 🤖 AI Services

### POST `/api/ai/stt`
Chuyển âm thanh thành văn bản có phân vai.
- **Form Data:** `file` (WebM/WAV)
- **Response:** 
  ```json
  {
    "text": "Full transcript...",
    "segments": [
      { "role": "doctor", "text": "Chào bạn, hôm nay bạn thấy sao?" },
      { "role": "patient", "text": "Tôi bị ho kéo dài bác sĩ ạ." }
    ]
  }
  ```

### POST `/api/ai/analyze`
Phân tích SOAP Multi-agent.
- **Request Body:** `{ "transcript": "...", "context": "..." }`
- **Response:**
  ```json
  {
    "analysis": {
      "subjective": "...",
      "objective": "...",
      "assessment": "...",
      "plan": "...",
      "diagnosis": "...",
      "icd_codes": "...",
      "medical_advice": "...",
      "risk_assessment": "..."
    }
  }
  ```

## 📊 Analytics

### GET `/api/dashboard/stats`
Lấy số liệu thống kê cho Dashboard bác sĩ.
- **Response:** 
  ```json
  {
    "totalPatients": 150,
    "todaySessions": 12,
    "avgMatchScore": 0.88
  }
  ```
