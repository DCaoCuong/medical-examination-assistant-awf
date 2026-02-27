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
                    content: `Bạn là một chuyên gia hiệu đính hồ sơ y tế. 
Nhiệm vụ:
1. Phân tách đoạn hội thoại sau thành các lượt nói của "Bác sĩ" và "Bệnh nhân".
2. Sửa lỗi chính tả các thuật ngữ y tế (ví dụ: "bi huyết áp" -> "bị huyết áp", "icd" -> "ICD").
3. Trả về định dạng JSON: {"segments": [{"role": "doctor" | "patient", "text": "..."}]}`
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
