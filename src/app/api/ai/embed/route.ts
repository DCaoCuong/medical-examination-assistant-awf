import { NextRequest, NextResponse } from 'next/server';
import { generateEmbeddings } from '@/lib/ai/google';

export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();

        if (!text || text.trim().length === 0) {
            return NextResponse.json({ error: 'Text is empty or invalid' }, { status: 400 });
        }

        console.log('--- Generating Embedding for text (first 50 chars):', text.substring(0, 50));
        const embedding = await generateEmbeddings(text);
        console.log('--- Embedding generated successfully, length:', embedding.length);

        return NextResponse.json({ embedding });
    } catch (error: any) {
        console.error('Embedding Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
