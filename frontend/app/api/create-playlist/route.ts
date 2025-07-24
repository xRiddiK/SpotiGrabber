import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
    try {
        const { artistName, accessToken } = await req.json();

        const userRes = await axios.get('https://api.spotify.com/v1/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const userId = userRes.data.id;

        const searchRes = await axios.get('https://api.spotify.com/v1/search', {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { q: `artist:${artistName}`, type: 'artist' },
        });

        if (!searchRes.data.artists.items.length) {
            return NextResponse.json({ message: `Artist "${artistName}" not found.` });
        }

        const artistId = searchRes.data.artists.items[0].id;

        let albums: any[] = [];
        let next = `https://api.spotify.com/v1/artists/${artistId}/albums?limit=50&include_groups=album,single,compilation`;
        while (next) {
            const albumsRes = await axios.get(next, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            albums = albums.concat(albumsRes.data.items);
            next = albumsRes.data.next;
        }

        const trackIdsSet = new Set<string>();
        for (const album of albums) {
            const tracksRes = await axios.get(`https://api.spotify.com/v1/albums/${album.id}/tracks`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            tracksRes.data.items.forEach((track: any) => trackIdsSet.add(track.id));
        }

        const trackIds = Array.from(trackIdsSet);

        let playlistName = `All songs by ${artistName}`;
        const cleanArtistName = artistName.trim();
        const matchesArtist = (name: string, match: string) =>
            name.toLowerCase().includes(match.toLowerCase());

        if (matchesArtist(cleanArtistName, 'lil peep')) {
            playlistName = 'Rest Easy Peep 🖤';
        }
        console.log('cleanArtistName:', cleanArtistName);
        console.log('matchesArtist result:', matchesArtist(cleanArtistName, 'lil peep'));

        const playlistRes = await axios.post(
            `https://api.spotify.com/v1/users/${userId}/playlists`,
            {
                name: playlistName,
                description: `All tracks by ${cleanArtistName}`,
                public: true
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );

        const playlistId = playlistRes.data.id;
        for (let i = 0; i < trackIds.length; i += 100) {
            await axios.post(
                `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
                { uris: trackIds.slice(i, i + 100).map((id) => `spotify:track:${id}`) },
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
        }

        return NextResponse.json({
            message: `Playlist created with ${trackIds.length} tracks!`,
            playlistUrl: playlistRes.data.external_urls.spotify,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Failed to create playlist.' }, { status: 500 });
    }
}
