// src/pages/WatchHistory.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import formatTime from "../utils/formatTime";
import { Link } from "react-router-dom";

const WatchHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideoHistory = async () => {
      try {
        const response = await axios.get(`/api/v1/users/watch`);
        setHistory(response.data?.data[0]?.watchHistory || []);
      } catch (error) {
        console.error("Error fetching watch history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideoHistory();
  }, []);

  const removeVideo = (id) => {
    setHistory((prev) => prev.filter((video) => video._id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-gray-500 dark:text-gray-300 bg-white dark:bg-black">
        Loading watch history...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-4xl font-bold tracking-tight mb-8">Watch History</h1>

        {history.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No videos in history.
          </p>
        ) : (
          <div className="space-y-6">
            {history.map((video) => (
              <div
                key={video._id}
                className="flex flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 group"
              >
                <Link
                  to={`/video/${video._id}`}
                  aria-label={`Watch video: ${video.title}`}
                  className="flex items-start w-full focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative w-52 h-32 flex-shrink-0">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                    />
                    <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                      {formatTime(video?.duration)}
                    </div>
                  </div>

                  {/* Text */}
                  <div className="p-4 flex-1">
                    <h2 className="text-lg font-semibold text-black dark:text-white line-clamp-2 group-hover:underline transition-colors">
                      {video.title}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {video?.owner?.username} • {video?.viwes || 0} views
                    </p>
                  </div>
                </Link>

                {/* Remove Button */}
                <div className="p-4">
                  <Button
                    variant="ghost"
                    onClick={() => removeVideo(video._id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title="Remove from history"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchHistory;
