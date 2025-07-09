import { Link } from "react-router-dom"
import formatTime from "../utils/formatTime"

export function PlaylistCard({ video }) {
  return (
    <Link
      to={`/video/${video._id}`}
      className="flex flex-col sm:flex-row gap-4 hover:bg-muted/30 p-2 rounded-lg transition group"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video sm:w-48 w-full rounded-md overflow-hidden bg-muted shrink-0">{console.log(video)
      }
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <img
            src={"/placeholder.svg"}
            alt="Video thumbnail"
            className="object-cover w-full h-full"
          />
        )}
        {/* Duration overlay */}
        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 py-0.5 rounded">
          {formatTime(video.duration)}
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-medium line-clamp-2 text-foreground">
            {video.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {video.description}
          </p>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {video.viwes ?? 0} views • {new Date(video.createdAt).toLocaleDateString()}
        </p>
      </div>
    </Link>
  )
}
