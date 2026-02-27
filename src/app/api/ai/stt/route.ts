import { NextRequest, NextResponse } from 'next/server';
import { groq } from '@/lib/ai/groq';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
        }

        // 1. Whisper transcription via Groq
        const transcription = await groq.audio.transcriptions.create({
            file: file,
            model: 'whisper-large-v3',
            response_format: 'json',
            language: 'vi',
        });

        // 2. Post-processing: Role Detection & Medical Text Fixer
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `Bạn là một trợ lý y tế kỹ thuật số chuyên nghiệp. 
Nhiệm vụ của bạn là hiệu đính và cấu trúc lại văn bản thô từ hệ thống Speech-to-Text (STT).

QUY TẮC PHÂN VAI:
1. Phân tách đoạn hội thoại thành các lượt nói của "Bác sĩ" (doctor) và "Bệnh nhân" (patient).
2. "Bác sĩ" thường là người hỏi, đưa ra lời khuyên, yêu cầu kiểm tra.
3. "Bệnh nhân" thường là người trả lời, mô tả triệu chứng, tiền sử.

QUY TẮC HIỆU ĐÍNH Y TẾ:
1. Sửa lỗi chính tả các thuật ngữ y tế phổ biến (ví dụ: "bi huyết áp" -> "bị huyết áp", "icd" -> "ICD-10", "soap" -> "SOAP").
2. Chuyển đổi các đơn vị đo lường hoặc cách gọi dân dã sang từ chuyên môn nếu cần (ví dụ: "đường trong máu" -> "chỉ số đường huyết").
3. Đảm bảo văn bản mạch lạc nhưng giữ nguyên ý nghĩa gốc của hội thoại.

ĐỊNH DẠNG ĐẦU RA (JSON):
{
  "segments": [
    {"role": "doctor" | "patient", "text": "Nội dung câu nói đã được sửa lỗi..."}
  ]
}`
                },
                {
                    role: 'user',
                    content: transcription.text
                }
            ],
            model: 'llama-3.3-70b-versatile',
            response_format: { type: 'json_object' }
        });

        const refined = JSON.parse(completion.choices[0].message.content || '{"segments": []}');

        return NextResponse.json({
            text: transcription.text,
            segments: refined.segments
        });
    } catch (error: any) {
        console.error('STT Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
