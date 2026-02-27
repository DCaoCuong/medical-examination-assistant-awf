import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        // 1. Total patients
        const totalPatientsRes = await query('SELECT count(*) FROM users WHERE role = $1', ['patient']);

        // 2. Sessions counts
        const todaySessionsRes = await query(
            "SELECT count(*) FROM bookings WHERE created_at >= CURRENT_DATE"
        );
        const weekSessionsRes = await query(
            "SELECT count(*) FROM bookings WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'"
        );

        // 3. Average match score (from comparison_records)
        const avgScoreRes = await query(
            "SELECT AVG(match_score) as avg FROM comparison_records"
        );

        return NextResponse.json({
            totalPatients: parseInt(totalPatientsRes.rows[0].count),
            todaySessions: parseInt(todaySessionsRes.rows[0].count),
            weekSessions: parseInt(weekSessionsRes.rows[0].count),
            avgMatchScore: parseFloat(avgScoreRes.rows[0].avg || 0)
        });
    } catch (error: any) {
        console.error('STATS_ERROR:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
