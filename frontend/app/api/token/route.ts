import { NextResponse } from 'next/server';
import axios from 'axios';
import { ENV } from "@/lib/env";

export async function POST(req: Request) {
    const { code } = await req.json();

    try {
        const params = new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: ENV.REDIRECT_URI,
            client_id: ENV.CLIENT_ID,
            client_secret: ENV.CLIENT_SECRET,
        });

        const response = await axios.post('https://accounts.spotify.com/api/token', params.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        return NextResponse.json(response.data);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to get token' }, { status: 500 });
    }
}
