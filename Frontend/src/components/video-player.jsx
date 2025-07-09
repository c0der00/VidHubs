export function VideoPlayer({videoId}) {  
    return (
      <div className="aspect-video w-full bg-muted">
        <video
          src={videoId.videoFile}
          title="YouTube video player"
          controls
          playsInline
          className="h-full w-full"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    )
  }