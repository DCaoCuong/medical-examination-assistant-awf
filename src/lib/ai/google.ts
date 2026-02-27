import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GOOGLE_AI_API_KEY) {
    console.warn('Missing GOOGLE_AI_API_KEY in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export const embeddingModel = genAI.getGenerativeModel({ model: 'models/gemini-embedding-001' });

/**
 * Generate embeddings for a given text
 */
export async function generateEmbeddings(text: string) {
    try {
        console.log('--- Calling Google AI Embed API...');
        const result = await embeddingModel.embedContent(text);

        if (!result || !result.embedding || !result.embedding.values) {
            console.error('--- Invalid response structure from Google AI:', JSON.stringify(result));
            throw new Error('Invalid response from Google Embedding API');
        }

        return result.embedding.values;
    } catch (error: any) {
        console.error('--- Google AI Embedding Exception:', error.message);
        throw error;
    }
}
