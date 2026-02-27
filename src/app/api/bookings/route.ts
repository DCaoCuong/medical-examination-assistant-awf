import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const { user_id, doctor_id } = await req.json();

        if (!user_id) {
            return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
        }

        // Create a new booking/session for the examination
        const result = await query(
            `INSERT INTO bookings (user_id, doctor_id, status, booking_time) 
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING id`,
            [user_id, doctor_id || null, 'in_progress']
        );

        return NextResponse.json(result.rows[0]);
    } catch (error: any) {
        console.error('CREATE_BOOKING_ERROR:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
