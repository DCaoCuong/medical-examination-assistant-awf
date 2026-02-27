import { NextRequest, NextResponse } from 'next/server';
import { groq } from '@/lib/ai/groq';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
        }

        // Whisper transcription via Groq
        const transcription = await groq.audio.transcriptions.create({
            file: file,
            model: 'whisper-large-v3',
            response_format: 'json',
            language: 'vi',
        });

        return NextResponse.json({ text: transcription.text });
    } catch (error: any) {
        console.error('STT Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
