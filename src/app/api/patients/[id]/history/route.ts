import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const result = await query(
            `SELECT mr.*, b.booking_time, b.status as booking_status
             FROM medical_records mr
             JOIN bookings b ON mr.booking_id = b.id
             WHERE b.user_id = $1
             ORDER BY b.booking_time DESC`,
            [id]
        );

        return NextResponse.json(result.rows);
    } catch (error: any) {
        console.error('HISTORY_FETCH_ERROR:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
