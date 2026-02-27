import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const { user_id, doctor_id, patient_name, patient_phone } = await req.json();

        if (!user_id) {
            return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
        }

        let finalName = patient_name;
        let finalPhone = patient_phone;

        // Fetch patient details if not provided (required by schema)
        if (!finalName || !finalPhone) {
            const userResult = await query('SELECT name, phone FROM users WHERE id = $1', [user_id]);
            if (userResult.rows.length > 0) {
                finalName = finalName || userResult.rows[0].name;
                finalPhone = finalPhone || userResult.rows[0].phone;
            }
        }

        // Create a new booking/session for the examination
        const result = await query(
            `INSERT INTO bookings (user_id, doctor_id, status, booking_time, patient_name, patient_phone) 
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4, $5) RETURNING id`,
            [user_id, doctor_id || null, 'in_progress', finalName || 'Unknown Patient', finalPhone || 'N/A']
        );

        return NextResponse.json(result.rows[0]);
    } catch (error: any) {
        console.error('CREATE_BOOKING_ERROR:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
