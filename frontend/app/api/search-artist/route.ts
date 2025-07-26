import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const query = req.nextUrl.searchParams.get('q');
    const token = req.nextUrl.searchParams.get('token'); // use this now

    if (!query || !token) {
        return NextResponse.json({ error: 'Missing query or token' }, { status: 400 });
    }

    const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=5`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await res.json();
    return NextResponse.json({ artists: data.artists?.items || [] });
}