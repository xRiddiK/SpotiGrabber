'use client';

import React, { useState, useEffect } from 'react';

export default function Home() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [artistName, setArtistName] = useState('');
  const [message, setMessage] = useState('');
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('access_token');
    if (token) {
      setAccessToken(token);
      window.history.replaceState({}, document.title, '/');
    }
  }, []);

  const login = () => {
    window.location.href = '/api/login';
  };

  const createPlaylist = async () => {
    if (!artistName.trim()) {
      setMessage('Please enter an artist name.');
      return;
    }
    if (!accessToken) {
      setMessage('Please login first.');
      return;
    }
    setLoading(true);
    setMessage('Creating playlist...');

    try {
      const res = await fetch('/api/create-playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistName, accessToken }),
      });
      const data = await res.json();
      setMessage(data.message);
      if (data.playlistUrl) setPlaylistUrl(data.playlistUrl);
    } catch {
      setMessage('Failed to create playlist.');
    } finally {
      setLoading(false);
    }
  };

  const removeDuplicates = async () => {
    alert("DUPLICATE REMOVER IS CURRENTLY DISABLED DUE TO A BUG THAT REMOVES BOTH SONGS. This will be fixed soon (hopefully).");
    return;

    if (!accessToken) {
      setMessage('Please login first.');
      return;
    }

    setRemoving(true);
    setMessage('Removing duplicates...');

    try {
      const res = await fetch('/api/remove-duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      });
      const data = await res.json();
      setMessage(data.message);
    } catch {
      setMessage('Failed to remove duplicates.');
    } finally {
      setRemoving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#121212] flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-[#181818] rounded-lg shadow-lg p-8 flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-white font-sans text-center select-none">
          Spotify Artist Grabber
        </h1>
        <p className="text-center text-[#b3b3b3]">
          Create a Playlist with all the Songs of your Favorite Artist
        </p>

        {!accessToken ? (
          <button
            onClick={login}
            className="w-full py-3 rounded-full bg-[#1DB954] text-black font-semibold text-lg shadow-md hover:bg-[#1ed760] transition"
          >
            Log in with Spotify
          </button>
        ) : (
          <>
            <input
              type="text"
              placeholder="Artist name"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              className="w-full px-4 py-3 rounded-full bg-[#282828] placeholder-[#b3b3b3] text-white text-lg focus:outline-none focus:ring-2 focus:ring-[#1DB954] transition"
              spellCheck={false}
              autoComplete="off"
            />

            <button
              onClick={createPlaylist}
              disabled={loading}
              className="w-full py-3 rounded-full bg-[#1DB954] text-black font-semibold text-lg shadow-md hover:bg-[#1ed760] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Playlist'}
            </button>

            {playlistUrl && (
              <a
                href={playlistUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-[#1DB954] underline mt-1 select-text"
              >
                Open Playlist on Spotify
              </a>
            )}

            <button
              onClick={removeDuplicates}
              disabled={removing}
              className="w-full py-3 rounded-full bg-[#282828] text-[#b3b3b3] font-semibold text-lg shadow-inner hover:bg-[#3a3a3a] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {removing ? 'Removing duplicates...' : 'Remove Duplicates'}
            </button>
          </>
        )}

        {message && (
          <p className="mt-4 text-center text-[#b3b3b3] font-medium select-text">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}