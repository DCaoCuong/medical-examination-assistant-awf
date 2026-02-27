import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GOOGLE_AI_API_KEY) {
    console.warn('Missing GOOGLE_AI_API_KEY in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });

/**
 * Generate embeddings for a given text
 */
export async function generateEmbeddings(text: string) {
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
}
