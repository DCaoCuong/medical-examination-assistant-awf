import Groq from 'groq-sdk';

if (!process.env.GROQ_API_KEY) {
    console.warn('Missing GROQ_API_KEY in environment variables');
}

export const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

/**
 * Transcription helper using Whisper-large-v3
 */
export async function transcribeAudio(file: File) {
    const transcription = await groq.audio.transcriptions.create({
        file: file,
        model: 'whisper-large-v3',
        response_format: 'json',
        language: 'vi', // Ưu tiên tiếng Việt
    });
    return transcription.text;
}

/**
 * Chat completion helper for NLP tasks (Llama 3 70B suggested)
 */
export async function analyzeWithLlama(prompt: string, systemPrompt?: string) {
    const chatCompletion = await groq.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: systemPrompt || 'Bạn là một trợ lý y tế chuyên nghiệp, hỗ trợ bác sĩ tóm tắt bệnh án.'
            },
            {
                role: 'user',
                content: prompt,
            },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.1, // Giữ sự ổn định cho kết quả y tế
    });

    return chatCompletion.choices[0]?.message?.content;
}
