import axios from "axios";
import React, { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import formatTime from "../utils/formatTime";

function LikeVideo() {
    const [loading, setLoading] = useState(false);
    const [likesVideos, setLikesVideo] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchVideoLikes = async () => {
        if (loading) return;
        setLoading(true);

        try {
            const response = await axios.get(`/api/v1/like/getlikedvideos?pages=${page}`);
            const newVideosLikes = response.data?.data?.videos || [];
            const pagination = response.data?.data?.pagination;
            console.log(newVideosLikes);

            setLikesVideo((prev) => {
                const combined = [...prev, ...newVideosLikes];
                const unique = Array.from(new Map(combined.map(v => [v._id, v])).values());
                return unique;
            });

            setHasMore(pagination?.hasNextPage);
            setPage((prev) => prev + 1);
        } catch (error) {
            console.error("Failed to fetch liked videos", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVideoLikes();
    }, []);

    return (
        <>
            {likesVideos.length > 0 ? (
                <InfiniteScroll
                    dataLength={likesVideos.length}
                    next={fetchVideoLikes}
                    hasMore={hasMore}
                    loader={
                        <div className="flex justify-center my-4">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    }
                    endMessage={
                        likesVideos.length > 0 && !hasMore && (
                            <p className="text-center text-gray-500 my-4">
                                No more videos to load
                            </p>
                        )
                    }
                >
                    <div className="grid mt-3 mx-4 grid-row-1 gap-4 ">
                        {likesVideos.map((likesVideo) => (
                            <div key={likesVideo._id} className="space-y-6">
                                <div className="flex flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 group">
                                    <Link
                                        to={`/video/${likesVideo._id}`}
                                        aria-label={`Watch video: ${likesVideo.title}`}
                                        className="flex items-start w-full focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg overflow-hidden"
                                    >
                                        {/* Image */}
                                        <div className="relative w-52 h-32 flex-shrink-0">
                                            <img
                                                src={likesVideo.thumbnail}
                                                alt={likesVideo.title}
                                                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                                            />
                                            <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                                                {formatTime(likesVideo?.duration)}
                                            </div>
                                        </div>

                                        {/* Text */}
                                        <div className="p-4 flex-1">
                                            <h2 className="text-lg font-semibold text-black dark:text-white line-clamp-2 group-hover:underline transition-colors">
                                                {likesVideo.title}
                                            </h2>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                {likesVideo?.owner?.username} • {likesVideo?.viwes || 0} views
                                            </p>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </InfiniteScroll>
            ) : (
                <div className="text-center text-gray-500 mt-10 text-lg">
                    No liked videos available.
                </div>
            )}
        </>
    );
}

export default LikeVideo;
