import { NextResponse } from 'next/server';
import axios from 'axios';

const CLIENT_ID = process.env.CLIENT_ID!;
const CLIENT_SECRET = process.env.CLIENT_SECRET!;
const REDIRECT_URI = process.env.REDIRECT_URI!;

export async function POST(req: Request) {
    const { code } = await req.json();

    try {
        const params = new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: REDIRECT_URI,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
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
