import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;

        const result = await query(
            'SELECT id, name, phone, birth_date, gender, medical_history, allergies, blood_type FROM users WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error: any) {
        console.error('DATABASE_ERROR:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
