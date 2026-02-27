import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        // Truy vấn từ bảng 'users' theo ERD, lọc role nếu cần (giả định role='patient' hoặc lấy tất cả cho demo)
        const result = await query('SELECT id, name, phone, birth_date, gender FROM users ORDER BY name ASC');
        return NextResponse.json(result.rows);
    } catch (error: any) {
        console.error('DATABASE_CONNECTION_ERROR:', error.message);
        return NextResponse.json(
            {
                error: 'Database connection failed',
                message: error.message,
                hint: 'Kiểm tra lại mật khẩu Database trong .env.local và tên bảng "users"'
            },
            { status: 500 }
        );
    }
}
