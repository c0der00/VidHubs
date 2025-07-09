import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { VideoCard } from "../components/video-card";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/authSlice";
import InfiniteScroll from "react-infinite-scroll-component";
import { Loader2 } from "lucide-react";

function Home() {
  const [user, setUser] = useState(null);
  const [showLoginBanner, setShowLoginBanner] = useState(true);
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);

  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") || "song";

  const dispatch = useDispatch();

  const fetchVideos = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);

      const response = await axios.get(
        `http://localhost:8000/api/v1/videos/getAllVideo?query=${query}&page=${page}&limit=10&sortBy=views&sortType=desc`
      );

      const newVideos = response.data.data;
      const pagination = response.data.massage.pagination;

      if (page === 1) {
        setVideos(newVideos);
      } else {
        setVideos((prev) => [...prev, ...newVideos]);
      }

      setHasMore(pagination.hasNextPage);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
      setInitialLoaded(true);
    }
  }, [query, page, hasMore, loading]);

  useEffect(() => {
    setVideos([]);
    setPage(1);
    setHasMore(true);
    setInitialLoaded(false);
  }, [query]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const response = await axios.get("/api/v1/users/current-user");
        setUser(response.data);
        dispatch(loginSuccess(response.data));
        setShowLoginBanner(false);
      } catch (error) {
        try {
          await axios.post("/api/v1/users/refresh-token");
          const retryResponse = await axios.get("/api/v1/users/current-user");
          setUser(retryResponse.data);
          dispatch(loginSuccess(retryResponse.data));
          setShowLoginBanner(false);
        } catch {
          setShowLoginBanner(true);
        }
      }
    };

    getCurrentUser();
  }, [dispatch]);

  return (
    <div>
      {showLoginBanner && (
        <Alert className="mb-4 mt-4">
          <AlertTitle>Not logged in</AlertTitle>
          <AlertDescription>
            Please <Link to="/login" className="font-medium underline">log in</Link> to access all features
          </AlertDescription>
        </Alert>
      )}

      {initialLoaded && videos.length === 0 && !loading ? (
        <div className="text-center text-gray-500 mt-10 text-lg">
          No videos available.
        </div>
      ) : (
        <InfiniteScroll
          dataLength={videos.length}
          next={fetchVideos}
          hasMore={hasMore}
          loader={
            <div className="flex justify-center my-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          }
          endMessage={
            videos.length > 0 && (
              <p className="text-center text-gray-500 my-4">
                No more videos to load
              </p>
            )
          }
        >
          <div className="grid mt-3 mx-4 grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        </InfiniteScroll>
      )}
    </div>
  );
}

export default Home;
