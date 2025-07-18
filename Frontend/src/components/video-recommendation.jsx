import { useEffect, useState } from "react";
import { VideoCard } from "./video-card";
import newRequest from "../utils/newRequest";



// const recommendedVideoss = [
//   {
//     _id: "67b9563489f4e21da276fab6",
//     videoFile:
//       "http://res.cloudinary.com/dqq8qdgtp/video/upload/v1740199479/zayi0nog7pe8ssvt43kq.mp4",
//     thumbnail:
//       "http://res.cloudinary.com/dqq8qdgtp/image/upload/v1740199480/zynwzirzea3po9ocus4h.png",
//     title: "title",
//     description: "this is description",
//     duration: 30.526667,
//     views: 0,
//     isPublished: true,
//     owner: {
//       _id: "67b7454946a02fe6b341009c",
//       username: "zeeshan",

//       fullName: "Zeeshan Faiyaz",
//     },
//     createdAt: "2025-02-22T04:44:36.843Z",
//     updatedAt: "2025-02-22T04:44:36.843Z",
//     __v: 0,
//     likesCount: 0,
//   },
// ];

export function VideoRecommendations({ video }) {
  const [recommendedVideos, setRecommendedVideo] = useState([]);

  useEffect(() => {
    
    const fatchRecommondedVideo = async () => {
    try {     
        const response = await newRequest.get(`/api/v1/videos/getVideo/${video._id}/recom`);
         console.log(response,'llllllllllllllllllllllllllllllllllllllllllllllllllllll');
        if(!response){
          return json(new Error(404,"videos no more"))
        }
        setRecommendedVideo(response.data?.data?.recommend);
      }
    catch (error) {
      throw new Error(500,"somithing wons wrong")
    }}
    fatchRecommondedVideo();
  }, [video])

  return (
    <div className="space-y-4">
      {recommendedVideos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}
