import { NextRequest, NextResponse } from 'next/server';
import { generateEmbeddings } from '@/lib/ai/google';

export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();

        if (!text) {
            return NextResponse.json({ error: 'No text provided' }, { status: 400 });
        }

        const embedding = await generateEmbeddings(text);

        return NextResponse.json({ embedding });
    } catch (error: any) {
        console.error('Embedding Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
