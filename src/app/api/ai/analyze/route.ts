import { NextRequest, NextResponse } from 'next/server';
import { analyzeWithLlama } from '@/lib/ai/groq';

export async function POST(req: NextRequest) {
    try {
        const { transcript, context } = await req.json();

        if (!transcript) {
            return NextResponse.json({ error: 'No transcript provided' }, { status: 400 });
        }

        const systemPrompt = `
      Bạn là một trợ lý bác sĩ chuyên nghiệp. Nhiệm vụ của bạn là:
      1. Phân tích đoạn hội thoại giữa bác sĩ và bệnh nhân.
      2. Phân biệt ai đang nói (Bác sĩ/Bệnh nhân).
      3. Tóm tắt nội dung theo cấu trúc SOAP (Subjective, Objective, Assessment, Plan).
      4. Gợi ý mã ICD-10 và chuẩn đoán sơ bộ.
      5. Kết quả trả về dưới dạng JSON.
    `;

        const userPrompt = `
      Nội dung cuộc hội thoại:
      "${transcript}"

      Thông tin thêm: ${context || 'Không có'}
    `;

        const analysis = await analyzeWithLlama(userPrompt, systemPrompt);

        return NextResponse.json({ analysis });
    } catch (error: any) {
        console.error('Analysis Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
