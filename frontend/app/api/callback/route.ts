import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { ENV } from "@/lib/env";

export async function GET(req: NextRequest) {
    const code = req.nextUrl.searchParams.get('code');

    if (!code) {
        return NextResponse.json({ error: 'Missing code' }, { status: 400 });
    }

    try {
        const params = new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: ENV.REDIRECT_URI,
            client_id: ENV.CLIENT_ID,
            client_secret: ENV.CLIENT_SECRET,
        });

        const tokenRes = await axios.post('https://accounts.spotify.com/api/token', params.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        const access_token = tokenRes.data.access_token;

        return NextResponse.redirect(`${ENV.FRONTEND_URI}/?access_token=${access_token}`);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to get token' }, { status: 500 });
    }
}