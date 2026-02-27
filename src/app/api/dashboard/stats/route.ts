import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        // 1. Total patients
        const totalPatientsRes = await query('SELECT count(*) FROM users WHERE role = $1', ['patient']);

        // 2. Today sessions
        const todaySessionsRes = await query(
            "SELECT count(*) FROM bookings WHERE created_at >= CURRENT_DATE"
        );

        // 3. Average match score
        const avgScoreRes = await query(
            "SELECT AVG(match_score) FROM comparison_records"
        );

        return NextResponse.json({
            totalPatients: parseInt(totalPatientsRes.rows[0].count),
            todaySessions: parseInt(todaySessionsRes.rows[0].count),
            avgMatchScore: parseFloat(avgScoreRes.rows[0].avg || 0)
        });
    } catch (error: any) {
        console.error('STATS_ERROR:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
