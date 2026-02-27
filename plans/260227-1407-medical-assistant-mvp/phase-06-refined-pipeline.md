# Phase 06: Refined AI Pipeline (Roles & Structure)

Status: ✅ Complete

## Objective
Nâng cấp khả năng xử lý âm thanh: Phân biệt vai trò (Bác sĩ/Bệnh nhân), sửa lỗi từ ngữ chuyên môn y tế và hiển thị Transcript có cấu trúc.

## Tasks:
- [x] **Role Detection:** Prompt AI để phân tách hội thoại thành `Bác sĩ:` và `Bệnh nhân:`.
- [x] **Medical Text Fixer:** Hậu xử lý văn bản từ Whisper để sửa các thuật ngữ y tế bị sai chính tả/nhận diện nhầm.
- [x] **Structured UI:** Hiển thị Transcript trong Examination Page theo dạng bong bóng hội thoại (Chat-like) để dễ theo dõi.
- [x] **Real-time Status:** Cập nhật UI thể hiện từng bước: 🎙️ Ghi âm -> 🔄 STT -> 🩺 Phân tích.

## Output:
- Transcript chuyên nghiệp, dễ đọc, phân vai rõ ràng. Giao diện Examination Page mượt mà theo từng bước.
