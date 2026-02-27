# Changelog - Senlyzer Medical Assistant

## [2026-02-27] - Hoàn thiện MVP+ Multi-agent
### Added
- **Multi-Agent AI Analysis**: Hệ thống phân tích SOAP, ICD-10 và Lời khuyên y tế với 3 Agent chuyên biệt.
- **Role Detection STT**: Whisper + Llama giúp phân biệt lời nói giữa Bác sĩ và Bệnh nhân.
- **Matching Engine**: Thuật toán Cosine Similarity đo độ tương đồng giữa ghi chú BS và AI gợi ý.
- **Analytics Dashboard**: Thống kê số ca khám và độ chính xác AI thời gian thực.
- **Database Schema**: Hoàn thiện các bảng `bookings`, `medical_records`, `comparison_records`.
- **Examination UI**: Giao diện tiến trình dọc (Vertical Flow) với trình ghi âm trực quan.

### Changed
- Cập nhật luồng Examination Page: Ghi âm -> Phân vai -> Review & Edit -> So sánh khớp -> Lưu.
- Chuyển đổi API STT từ trả về text đơn thuần sang JSON Segments phân vai.

### Fixed
- Lỗi kết nối Database với chuỗi `POSTGRES_URL` trong môi trường local.
- Lỗi không hiển thị đúng font/định dạng thuật ngữ y khoa trong transcript.
