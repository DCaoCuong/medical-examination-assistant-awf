# Phase 07: Multi-Agent Analysis & Medical RAG

Status: ⬜ Pending

## Objective
Triển khai hệ thống đa tác nhân (Multi-agent) để phân tích sâu và cung cấp tư vấn y tế dựa trên kiến thức cơ sở (RAG).

## Tasks:
- [x] **Multi-Agent Setup:** Chia nhỏ Prompt thành 3 Agent:
    - **Scribe Agent:** Chuyên trách tóm tắt SOAP (S, O, A).
    - **ICD Classifier:** Chuyên trách gán mã ICD-10 chính xác dựa trên Assessment.
    - **Protocol Agent (New):** Căn cứ vào ICD-10 và Assessment để truy xuất **"Phác đồ điều trị"** chuẩn từ cơ quan y tế có thẩm quyền.
- [x] **Protocol-Based RAG:** Xây dựng cơ sở dữ liệu (Vector DB) chứa các Phác đồ điều trị chính thống. AI sẽ trích xuất lời khuyên và tự động đề xuất mục **"P - Plan"** dựa trên phác đồ này.
- [x] **Suggestion UI:** Thêm box "AI Advice & Protocol Reference" bên cạnh form SOAP Review, hiển thị rõ nguồn phác đồ được trích dẫn.

## Output:
- Kết quả phân tích có chiều sâu hơn, giảm sai sót nhờ sự chuyên môn hóa của các Agent. Bác sĩ nhận được gợi ý điều trị hữu ích.
