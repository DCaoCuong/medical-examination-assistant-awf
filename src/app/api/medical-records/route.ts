import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            booking_id,
            diagnosis,
            subjective,
            objective,
            assessment,
            plan,
            icd_codes,
            doctor_notes,
            // For comparison_records
            ai_results,
            match_score
        } = body;

        if (!booking_id) {
            return NextResponse.json({ error: 'Missing booking_id' }, { status: 400 });
        }

        // 1. Save to medical_records
        const medicalRecordResult = await query(
            `INSERT INTO medical_records (
        booking_id, diagnosis, subjective, objective, assessment, plan, icd_codes, doctor_notes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
            [booking_id, diagnosis, subjective, objective, assessment, plan, JSON.stringify(icd_codes), doctor_notes, 'completed']
        );

        const medical_record_id = medicalRecordResult.rows[0].id;

        // 2. Save to comparison_records if match_score exists
        if (match_score !== undefined) {
            await query(
                `INSERT INTO comparison_records (
          medical_record_id, ai_results, doctor_results, match_score, timestamp
        ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
                [
                    medical_record_id,
                    JSON.stringify(ai_results),
                    JSON.stringify({ diagnosis, subjective, objective, assessment, plan }),
                    match_score
                ]
            );
        }

        // 3. Update booking status
        await query('UPDATE bookings SET status = $1 WHERE id = $2', ['completed', booking_id]);

        return NextResponse.json({ success: true, medical_record_id });
    } catch (error: any) {
        console.error('SAVE_RECORD_ERROR:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
