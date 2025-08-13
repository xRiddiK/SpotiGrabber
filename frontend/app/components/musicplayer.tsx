'use client';
import { FC, useEffect, useRef, useState } from "react";
import { Pause, Play, ChevronRight, ChevronLeft, Heart } from "lucide-react";
import { Progress } from "@/components/ui/progress"

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any;
  }
}

export interface MusicPlayerProps {
  accessToken: string;
  playlistUrl: string;
}

export const MusicPlayer: FC<MusicPlayerProps> = ({ accessToken, playlistUrl }) => {
  const [player, setPlayer] = useState<any>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [liked, setLiked] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const hasQueuedPlaylist = useRef(false);

  const getPlaylistId = (url: string) => {
    const match = url.match(/playlist\/([a-zA-Z0-9]+)(\?|$)/);
    return match ? match[1] : null;
  };

  useEffect(() => {
    if (!accessToken) return;

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const spotifyPlayer = new window.Spotify.Player({
        name: "JXCS.SPACE",
        getOAuthToken: (cb: (token: string) => void) => cb(accessToken),
        volume: 0.5,
      });

      spotifyPlayer.addListener("ready", async ({ device_id }: { device_id: string }) => {
        setDeviceId(device_id);
        setIsReady(true);

        if (!hasQueuedPlaylist.current) {
          hasQueuedPlaylist.current = true;
          const playlistId = getPlaylistId(playlistUrl);
          if (!playlistId) return;

          try {
            await fetch("https://api.spotify.com/v1/me/player", {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ device_ids: [device_id], play: false }),
            });

            await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${device_id}`, {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                context_uri: `spotify:playlist:${playlistId}`,
                offset: { position: 0 },
              }),
            });
          } catch (err) {
            console.error("Failed to queue playlist:", err);
          }
        }
      });

      spotifyPlayer.addListener("player_state_changed", (state: any) => {
        if (!state) return;
        setIsPlaying(!state.paused);
        setCurrentTrack(state.track_window.current_track);
        setPosition(state.position);
        setDuration(state.duration);

        if (!isPlayerReady && state.track_window.current_track) {
          setIsPlayerReady(true);
        }
      });

      spotifyPlayer.addListener("playback_error", ({ message }: { message: string }) => {
        console.error("Playback error:", message);
      });

      spotifyPlayer.connect();
      setPlayer(spotifyPlayer);
    };
  }, [accessToken, playlistUrl]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setPosition((prev) => Math.min(prev + 1000, duration));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const safeAction = async (action: () => Promise<void>) => {
    if (!player || !isReady || !isPlayerReady) return;
    try {
      await action();
    } catch (err) {
      console.warn("Player action failed", err);
    }
  };

  const togglePlay = () => safeAction(async () => {
    const state = await player.getCurrentState();
    if (!state) return;
    await player.togglePlay();
  });

  const skipNext = () => safeAction(() => player.nextTrack());
  const skipPrevious = () => safeAction(() => player.previousTrack());

  return (
    <>
      {!isPlayerReady ? (
        <div className="fixed bottom-0 left-0 right-0 bg-[#181818] text-white flex items-center justify-center px-4 py-2 shadow-lg z-50">
          Loading player...
        </div>
      ) : (
        <div className="fixed bottom-0 left-0 right-0 bg-[#181818] text-white flex items-center px-4 py-2 shadow-lg z-50">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={currentTrack?.album.images[0]?.url || "https://heroui.com/images/album-cover.png"}
              className="w-12 h-12 rounded-sm flex-shrink-0"
              alt="Album cover"
            />
            <div className="flex flex-col overflow-hidden min-w-0">
              <span className="font-semibold truncate">{currentTrack?.name || "Frontend Radio"}</span>
              <span className="text-sm text-gray-400 truncate">
                {currentTrack?.artists?.map((a: any) => a.name).join(", ") || "Daily Mix • 12 Tracks"}
              </span>
            </div>
          </div>

          <div className="flex-1 flex justify-center mx-4 min-w-0">
            <div className="w-full max-w-lg">
              <Progress value={duration ? (position / duration) * 100 : 0} />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{new Date(position).toISOString().substr(14, 5)}</span>
                <span>{new Date(duration).toISOString().substr(14, 5)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
