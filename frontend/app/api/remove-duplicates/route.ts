import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
    try {
        const { accessToken } = await req.json();

        const userRes = await axios.get('https://api.spotify.com/v1/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const userId = userRes.data.id;

        const playlistsRes = await axios.get(`https://api.spotify.com/v1/users/${userId}/playlists?limit=50`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const playlist = playlistsRes.data.items.find((pl: any) => pl.name.startsWith('All songs by'));
        if (!playlist) return NextResponse.json({ message: 'No playlist found to clean duplicates.' });

        const playlistId = playlist.id;

        let tracks: any[] = [];
        let next = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`;
        while (next) {
            const tracksRes = await axios.get(next, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            tracks = tracks.concat(tracksRes.data.items);
            next = tracksRes.data.next;
        }

        const seen = new Set<string>();
        const duplicatesUris: string[] = [];
        for (const item of tracks) {
            const trackId = item.track.id;
            if (seen.has(trackId)) {
                duplicatesUris.push(item.track.uri);
            } else {
                seen.add(trackId);
            }
        }

        if (duplicatesUris.length === 0) {
            return NextResponse.json({ message: 'No duplicates found!' });
        }

        for (let i = 0; i < duplicatesUris.length; i += 100) {
            await axios.request({
                url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
                method: 'DELETE',
                headers: { Authorization: `Bearer ${accessToken}` },
                data: {
                    tracks: duplicatesUris.slice(i, i + 100).map((uri) => ({ uri })),
                },
            });
        }

        return NextResponse.json({ message: `Removed ${duplicatesUris.length} duplicate tracks!` });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Failed to remove duplicates.' }, { status: 500 });
    }
}
