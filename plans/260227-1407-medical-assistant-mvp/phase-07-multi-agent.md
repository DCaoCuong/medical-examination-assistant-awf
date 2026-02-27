# Phase 07: Multi-Agent Analysis & Medical RAG

Status: ⬜ Pending

## Objective
Triển khai hệ thống đa tác nhân (Multi-agent) để phân tích sâu và cung cấp tư vấn y tế dựa trên kiến thức cơ sở (RAG).

## Tasks:
- [ ] **Multi-Agent Setup:** Chia nhỏ Prompt thành 3 Agent:
    - **Scribe Agent:** Chuyên trách tóm tắt SOAP.
    - **ICD Classifier:** Chuyên trách gán mã ICD-10 chính xác.
    - **Medical Expert:** Phân tích rủi ro và gợi ý cận lâm sàng.
- [ ] **Medical RAG:** Tích hợp bộ quy tắc hoặc tài liệu y tế để AI đưa ra lời khuyên có căn cứ (Medical Advice).
- [ ] **Suggestion UI:** Thêm box "AI Advice" bên cạnh form SOAP Review.

## Output:
- Kết quả phân tích có chiều sâu hơn, giảm sai sót nhờ sự chuyên môn hóa của các Agent. Bác sĩ nhận được gợi ý điều trị hữu ích.
