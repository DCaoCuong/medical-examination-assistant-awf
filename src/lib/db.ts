import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
        rejectUnauthorized: false // Required for Supabase external connections
    }
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
export default pool;
