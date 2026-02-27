# Phase 03: Core AI Services

Status: ✅ Complete [Production Ready]

## Tasks:
- [x] Xây dựng API Route xử lý Audio stream gửi lên Groq (Whisper Large v3).
- [x] Triển khai module NLP gọi Groq (Llama/OSS) để tóm tách text & phân biệt lời nói.
- [x] Triển khai module gọi Google AI Studio (Text-embedding-004) để lấy vector dữ liệu.

## Output:
- API endpoint (/api/ai/stt) nhận file âm thanh -> trả về text.
- API phân tích (/api/ai/analyze) tóm tắt SOAP.
- API embedding (/api/ai/embed) chuyển văn bản sang vector.
