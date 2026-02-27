/**
 * Tính toán độ tương đồng Cosine giữa hai vector (embeddings)
 * Kết quả từ 0 (không giống) đến 1 (giống hệt)
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
        throw new Error("Vectors must have the same length");
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
        return 0;
    }

    return dotProduct / (normA * normB);
}

/**
 * Chuyển số thập phân sang phần trăm làm tròn
 */
export function formatAsPercentage(value: number): string {
    // Handle both 0-1 and 0-100 ranges gracefully
    let percentage = (value > 1) ? value : value * 100;

    // Ensure it stays within 0-100%
    percentage = Math.max(0, Math.min(100, percentage));

    return percentage.toFixed(1) + "%";
}
