import { NextRequest, NextResponse } from 'next/server';
import { analyzeWithLlama } from '@/lib/ai/groq';
import { findProtocol } from '@/lib/ai/rag-protocol';

export async function POST(req: NextRequest) {
  try {
    const { transcript, context } = await req.json();

    if (!transcript) {
      return NextResponse.json({ error: 'No transcript provided' }, { status: 400 });
    }

    // --- STAGE 1: Scribe & ICD Agent ---
    const scribeSystemPrompt = `
      Bạn là Scribe & ICD Agent, một chuyên gia tóm tắt bệnh án y khoa. 
      Nhiệm vụ của bạn là trích xuất và phân tích hội thoại giữa Bác sĩ và Bệnh nhân.
      
      Yêu cầu CHI TIẾT:
      1. **Subjective (S)**: Ghi chép các triệu chứng, lý do khám, tiền sử do bệnh nhân cung cấp. Nếu chưa có, ghi "Đang thu thập thông tin".
      2. **Objective (O)**: Ghi chép các chỉ số sinh tồn, kết quả khám lâm sàng. Nếu chưa có, ghi "Chờ khám thực thể".
      3. **Assessment (A)**: Đưa ra nhận định sơ bộ hoặc chuẩn đoán phân biệt.
      4. **Diagnosis**: Tên bệnh cụ thể (Tiếng Việt).
      5. **ICD-10**: Mảng chứa các mã ICD-10 (VD: ["I10", "E11"]).
      
      QUY TẮC: Luôn trả về đầy đủ các trường JSON. Nếu thông tin trong transcript còn thiếu, hãy ghi nhận trạng thái hiện tại hoặc suy luận sơ bộ dựa trên câu hỏi của bác sĩ.
      
      Trả về định dạng JSON:
      {
        "subjective": "...",
        "objective": "...",
        "assessment": "...",
        "diagnosis": "...",
        "icd_codes": ["...", "..."]
      }
    `;

    const scribeUserPrompt = `
      Nội dung hội thoại: "${transcript}"
      Thông tin thêm: ${context || 'Không có'}
    `;

    const scribeResponse = await analyzeWithLlama(scribeUserPrompt, scribeSystemPrompt);
    let draft = { subjective: '', objective: '', assessment: '', diagnosis: '', icd_codes: [] };

    try {
      const jsonMatch = scribeResponse?.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        draft = { ...draft, ...JSON.parse(jsonMatch[0]) };
      }
    } catch (e) {
      console.error('JSON Parse Error Stage 1:', e);
    }

    // --- STAGE 2: Protocol RAG & Protocol Agent ---
    let finalAnalysis = {
      ...draft,
      plan: 'Đang chờ bác sĩ đánh giá thêm.',
      medical_advice: 'Dựa trên hội thoại hiện tại, chưa đủ thông tin để đưa ra lời khuyên chuyên sâu.',
      protocol_source: ''
    };

    if (draft.diagnosis || (draft.icd_codes && draft.icd_codes.length > 0)) {
      const protocol = await findProtocol(draft.diagnosis || '', draft.icd_codes || []);

      if (protocol) {
        const protocolSystemPrompt = `
          Bạn là Protocol Agent. Bạn có nhiệm vụ xây dựng Kế hoạch điều trị (P - Plan) dựa trên PHÁC ĐỒ ĐIỀU TRỊ CHÍNH THỨC.
          
          Pháp đồ căn cứ: ${protocol.authority}
          Hướng dẫn điều trị: ${protocol.plan_guidelines}
          
          Yêu cầu:
          1. Dựa trên thông tin bệnh nhân (S, O, A) và Phác đồ trên, hãy viết mục "Plan" (P) chi tiết.
          2. Đưa ra lời khuyên y tế (Medical Advice).
          
          Trả về định dạng JSON:
          {
            "plan": "...",
            "medical_advice": "...",
            "protocol_source": "${protocol.authority}"
          }
        `;

        const protocolUserPrompt = `
          Thông tin bệnh nhân:
          - S: ${draft.subjective}
          - O: ${draft.objective}
          - A: ${draft.assessment}
          - Chuẩn đoán: ${draft.diagnosis}
        `;

        const protocolResponse = await analyzeWithLlama(protocolUserPrompt, protocolSystemPrompt);
        try {
          const jsonMatch = protocolResponse?.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const protocolResults = JSON.parse(jsonMatch[0]);
            finalAnalysis = { ...finalAnalysis, ...protocolResults };
          }
        } catch (e) {
          console.error('JSON Parse Error Stage 2:', e);
        }
      } else {
        // Fallback Medical Expert
        const expertSystemPrompt = `
          Bạn là Medical Expert. Hãy dựa trên S, O, A để viết mục Plan (P) và Lời khuyên y tế.
          Trả về JSON: {"plan": "...", "medical_advice": "..."}
        `;
        const expertResponse = await analyzeWithLlama(scribeUserPrompt, expertSystemPrompt);
        try {
          const jsonMatch = expertResponse?.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const expertResults = JSON.parse(jsonMatch[0]);
            finalAnalysis = { ...finalAnalysis, ...expertResults };
          }
        } catch (e) {
          finalAnalysis.plan = expertResponse || finalAnalysis.plan;
        }
      }
    }

    return NextResponse.json({ analysis: finalAnalysis });
  } catch (error: any) {
    console.error('Analysis Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
