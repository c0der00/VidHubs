import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { VideoCard } from "./video-card";
import { PlaylistCard } from "./PlaylistCard";

export default function PlaylistDetailPage() {
  const { playlistId } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const res = await axios.get(`/api/v1/playlists/getplaylisbyid/${playlistId}`);
        setPlaylist(res.data);
        console.log(res.data);

        const video = res.data.data.videos;
        setVideos(video)
        
      } catch (err) {
        console.error("Error fetching playlist detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylist();
  }, [playlistId]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!playlist) return <div className="p-6">Playlist not found.</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{playlist.name}</h1>
        <p className="text-muted-foreground mt-1">{playlist.description}</p>
        <p className="text-sm text-muted-foreground mt-2">
          {videos.length} video{videos.length !== 1 && "s"}
        </p>
      </div>

      <div className="grid gap-4">
        {videos.map((video) => (
          <PlaylistCard key={video._id} video={video} />
        ))}
      </div>
    </div>
  );
}
