import { NextResponse } from 'next/server';
import { ENV } from "@/lib/env";

const SCOPES = 'playlist-modify-public playlist-modify-private user-read-private streaming user-read-email user-modify-playback-state user-read-playback-state';

export async function GET() {
  const params = new URLSearchParams({
    client_id: ENV.CLIENT_ID,
    response_type: 'code',
    redirect_uri: ENV.REDIRECT_URI,
    scope: SCOPES,
  });

  return NextResponse.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
}