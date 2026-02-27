import { NextRequest, NextResponse } from 'next/server';
import { analyzeWithLlama } from '@/lib/ai/groq';

export async function POST(req: NextRequest) {
    try {
        const { transcript, context } = await req.json();

        if (!transcript) {
            return NextResponse.json({ error: 'No transcript provided' }, { status: 400 });
        }

        const systemPrompt = `
      Bạn là một hệ thống đa tác nhân (Multi-agent System) chuyên nghiệp dành cho bác sĩ. 
      Bạn phải phân tích nội dung cuộc hội thoại dựa trên 3 vai trò chuyên biệt:

      1. **Scribe Agent**: Tóm tắt nội dung hội thoại chính xác vào mẫu SOAP (Subjective, Objective, Assessment, Plan).
      2. **ICD Classifier**: Tra cứu và gán tối đa 3 mã ICD-10 phù hợp nhất với chuẩn đoán.
      3. **Medical Expert**: Phân tích rủi ro, dự đoán tiến triển và đưa ra lời khuyên y tế (Medical Advice) dựa trên bằng chứng y khoa.

      Yêu cầu đầu ra JSON:
      {
        "subjective": "...",
        "objective": "...",
        "assessment": "...",
        "plan": "...",
        "diagnosis": "...",
        "icd_codes": "...",
        "medical_advice": "...",
        "risk_assessment": "..."
      }
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
