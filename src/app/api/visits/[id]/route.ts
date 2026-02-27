import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const result = await query('SELECT * FROM visits WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
        }
        return NextResponse.json(result.rows[0]);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await request.json();
        // Simplified update logic for MVP
        const result = await query(
            'UPDATE visits SET soap_notes = $1, status = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
            [JSON.stringify(body.soap_notes), body.status || 'completed', id]
        );
        return NextResponse.json(result.rows[0]);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
