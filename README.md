# 🏥 AI Medical Examination Assistant

**AI Medical Examination Assistant** là nền tảng hỗ trợ bác sĩ thông minh, giúp tự động hóa quy trình ghi chép bệnh án thông qua trí tuệ nhân tạo (AI). Hệ thống lắng nghe cuộc hội thoại giữa bác sĩ và bệnh nhân, thực hiện chuyển giọng nói thành văn bản (STT), và tự động phân tích để tạo ra hồ sơ y tế theo chuẩn **SOAP**.

---

## ✨ Tính năng chính

- 🎙️ **Ghi âm & Chuyển đổi giọng nói (STT):** Sử dụng Whisper-v3 từ Groq để chuyển đổi hội thoại y tế tiếng Việt cực kỳ chính xác.
- 🧠 **Hệ thống Multi-Agent AI:**
  - **Scribe Agent:** Tóm tắt hội thoại thành các mục S-O-A-P.
  - **ICD Classifier:** Gợi ý mã bệnh lý ICD-10 chính xác.
  - **Protocol Agent (RAG):** Đưa ra lời khuyên y khoa dựa trên các **Phác đồ điều trị chính thống** được cập nhật.
- 📊 **Phân tích độ khớp (Match Score):** So sánh mức độ tương đồng giữa chuẩn đoán của Bác sĩ và gợi ý của AI bằng Vector Embeddings.
- 📋 **Quản lý bệnh nhân:** Dashboard trực quan quản lý danh sách bệnh nhân và lịch sử khám bệnh.
- 🖨️ **Xuất bản hồ sơ:** Hỗ trợ in và xuất file PDF bệnh án chuyên nghiệp.
- 🌓 **Giao diện hiện đại:** Hỗ trợ Light/Dark mode, thiết kế linh hoạt và mượt mà với Framer Motion.

---

## 🛠️ Công nghệ sử dụng

- **Frontend:** [Next.js 15+](https://nextjs.org/), [Tailwind CSS](https://tailwindcss.com/)
- **AI Core:** [Groq SDK](https://groq.com/) (Whisper-large-v3, Llama-3.3-70b), [Google AI SDK](https://ai.google.dev/) (Text Embeddings)
- **Database:** [PostgreSQL](https://www.postgresql.org/) (Hỗ trợ tốt trên Supabase)
- **Icons & UI:** [Lucide React](https://lucide.dev/), [Framer Motion](https://www.framer.com/motion/)

---

## 🚀 Hướng dẫn cài đặt

### 1. Yêu cầu hệ thống
- **Node.js**: 18.x trở lên
- **NPM** hoặc **Yarn**
- **Git**

### 2. Cài đặt các tệp tin

```bash
# Clone dự án
git clone https://github.com/DCC-Senlyzer/medical-examination-assistant-awf.git

# Truy cập vào thư mục
cd medical-examination-assistant-awf

# Cài đặt thư viện
npm install
```

### 3. Cấu hình biến môi trường (`.env`)

Tạo file `.env.local` tại thư mục gốc và cấu hình các khóa sau:

```env
# API Keys từ Groq (https://console.groq.com/)
GROQ_API_KEY=your_groq_api_key

# API Keys từ Google AI Studio (https://aistudio.google.com/)
GOOGLE_AI_API_KEY=your_google_ai_key

# Chuỗi kết nối Database PostgreSQL (Supabase/Local)
POSTGRES_URL=postgresql://user:password@host:port/dbname
```

### 4. Khởi tạo Database

Bạn cần tạo các bảng sau trong Database:
- `users`: Lưu thông tin bác sĩ và bệnh nhân.
- `bookings`: Quản lý các phiên thăm khám.
- `medical_records`: Lưu trữ ghi chú SOAP và ICD-10.
- `comparison_records`: Lưu trữ kết quả phân tích AI và độ khớp.

### 5. Chạy dự án

```bash
# Chế độ phát triển
npm run dev

# Build bản Production
npm run build
npm run start
```

---

## 📖 Hướng dẫn sử dụng

1. **Dashboard:** Xem tổng quan tình hình khám chữa bệnh, lượt khám trong ngày và độ khớp trung bình của AI.
2. **Tiếp nhận:** Tìm kiếm hoặc chọn bệnh nhân từ danh sách.
3. **Thăm khám:** 
   - Nhấn nút "Bắt đầu ghi âm" trong suốt quá trình trao đổi với bệnh nhân.
   - Nhấn "Dừng" để AI bắt đầu phân tích dữ liệu.
   - Kiểm tra mẫu SOAP do AI gợi ý, chỉnh sửa lại theo ý kiến bác sĩ.
   - Nhấn "So sánh với AI" để xem độ lệch.
4. **Kết thúc:** Lưu hồ sơ để cập nhật vào lịch sử bệnh nhân.

---

## 📄 Giấy phép

Dự án được phát hành dưới giấy phép **MIT**. Mọi người có thể tự do đóng góp và phát triển thêm.

---

## 👨‍💻 Tác giả

Phát triển bởi **Senlyzer Team**.

- Email: doancaocuongvn@gmail.com

*"Công nghệ vì sức khỏe cộng đồng"*
