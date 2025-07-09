import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import { VideoPlayer } from "../components/video-player";
import { VideoInfo } from "../components/video-info";
import { CommentSection } from "../components/comment-section.jsx";
import { VideoRecommendations } from "../components/video-recommendation.jsx";

function VideoDetail() {
  const { videoId } = useParams();
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideoDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`/api/v1/videos/getVideo/${videoId}`);

        const fetchedVideo = response.data?.data;
        console.log(fetchedVideo);
        
        if (!fetchedVideo) {
          throw new Error("Video not found");
        }

        setVideoData(fetchedVideo);
      } catch (err) {
        console.error("Error fetching video:", err);
        setError(err.message || "Failed to fetch video");
      } finally {
        setLoading(false);
      }
    };

    fetchVideoDetails();
  }, [videoId]);

  useEffect(() => {
    if (videoData) {
      console.log("Fetched video data:", videoData);
    }
  }, [videoData]);

  if (loading) return <div className="text-center text-gray-600">Loading...</div>;
  if (error) return <div className="text-center text-red-500">Error: {error}</div>;
  if (!videoData) return <div className="text-center">No video found</div>;

  return (
    <div className="container mx-auto px-2 py-8 lg:flex lg:gap-6">
      <main className="lg:flex-grow lg:max-w-[calc(100%-352px)]">
        <VideoPlayer videoId={videoData} />
        <VideoInfo
          video={videoData}
          description={videoData.description}
          channelId={videoData.owner?._id}
          username={videoData.owner?.username}
        />
        <CommentSection video={videoData} />
      </main>
      <aside className="mt-6 lg:mt-0 lg:w-80">
        <VideoRecommendations video={videoData} />
      </aside>
    </div>
  );
}

export default VideoDetail;
