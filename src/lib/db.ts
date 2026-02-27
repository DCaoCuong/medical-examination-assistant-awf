import { Pool } from 'pg';

// Đảm bảo mật khẩu có ký tự đặc biệt không làm hỏng URI
const connectionString = process.env.POSTGRES_URL;

const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    },
    // Tăng thời gian timeout và số lượng kết nối tối đa cho chắc chắn
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 20,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
export default pool;
