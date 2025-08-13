import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

async function spotifyGet(url: string, accessToken: string) {
    try {
        return await axios.get(url, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
    } catch (err: any) {
        if (err.response?.status === 429) {
            const retryAfter = parseInt(err.response.headers['retry-after'] || '1', 10);
            console.warn(`Rate limited. Retrying after ${retryAfter}s`);
            await new Promise((res) => setTimeout(res, retryAfter * 1000));
            return spotifyGet(url, accessToken);
        }
        throw err;
    }
}

function dedupeAlbums(albums: any[]) {
    const seen = new Set<string>();
    return albums.filter((album) => {
        const key = `${album.name.toLowerCase()}_${album.release_date}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

async function fetchAllAlbumTracks(albums: any[], accessToken: string) {
    let allTracks: any[] = [];
    for (let i = 0; i < albums.length; i += 20) {
        const batchIds = albums.slice(i, i + 20).map((a) => a.id).join(',');
        const res = await spotifyGet(
            `https://api.spotify.com/v1/albums?ids=${batchIds}`,
            accessToken
        );

        res.data.albums.forEach((album: any) => {
            if (album.tracks?.items) {
                allTracks.push(...album.tracks.items);
            }
        });
        await new Promise((res) => setTimeout(res, 300));
    }
    return allTracks;
}

export async function POST(req: NextRequest) {
    try {
        const { artistName, accessToken, skipInstrumentals } = await req.json();
        const userRes = await spotifyGet('https://api.spotify.com/v1/me', accessToken);
        const userId = userRes.data.id;

        const searchRes = await spotifyGet(
            `https://api.spotify.com/v1/search?q=artist:${encodeURIComponent(
                artistName
            )}&type=artist`,
            accessToken
        );

        if (!searchRes.data.artists.items.length) {
            return NextResponse.json({ message: `Artist "${artistName}" not found.` });
        }

        const artistId = searchRes.data.artists.items[0].id;

        let albums: any[] = [];
        let next = `https://api.spotify.com/v1/artists/${artistId}/albums?limit=50&include_groups=album,single,compilation`;
        while (next) {
            const albumsRes = await spotifyGet(next, accessToken);
            albums = albums.concat(albumsRes.data.items);
            next = albumsRes.data.next;
        }

        albums = dedupeAlbums(albums);

        const allTracks = await fetchAllAlbumTracks(albums, accessToken);

        const filteredTracks = skipInstrumentals
            ? allTracks.filter(
                  (track) =>
                      !track.name.toLowerCase().includes('instrumental') &&
                      !(track.explicit === false && track.duration_ms < 90000)
              )
            : allTracks;

        const trackIds = [...new Set(filteredTracks.map((track) => track.id))];

        let playlistName = `All songs by ${artistName}`;
        const cleanArtistName = artistName.trim();
        const matchesArtist = (name: string, match: string) =>
            name.toLowerCase().includes(match.toLowerCase());

        if (matchesArtist(cleanArtistName, 'lil peep')) {
            playlistName = 'Rest Easy Peep 🖤';
        }

        const playlistRes = await axios.post(
            `https://api.spotify.com/v1/users/${userId}/playlists`,
            {
                name: playlistName,
                description: `All tracks by ${cleanArtistName}`,
                public: true,
            },
            {
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        );

        const playlistId = playlistRes.data.id;

        for (let i = 0; i < trackIds.length; i += 100) {
            await axios.post(
                `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
                { uris: trackIds.slice(i, i + 100).map((id) => `spotify:track:${id}`) },
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            await new Promise((res) => setTimeout(res, 300));
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