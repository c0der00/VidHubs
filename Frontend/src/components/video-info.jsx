import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { ThumbsUp, Share2, Facebook, Twitter, Wheat, Instagram, Linkedin, CopyIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import axios from "axios"
import {
  EmailIcon,
  EmailShareButton,
  FacebookShareButton,
  InstapaperShareButton,
  LinkedinShareButton,
  TwitterShareButton,
  WhatsappShareButton
} from "react-share";

export function VideoInfo({ video}) {
  const [channelData, setChannelData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLiked, setIsLiked] = useState(video.isLiked)
  const [likesCount, setLikesCount] = useState(video.likesCount)
  const [share,setShare] = useState(false);
  const currentUrl = window.location.href;

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        const response = await axios.get(`/api/v1/users/c/${video.owner.username}`)
        console.log('data',response);
        
        setChannelData(response.data.data)
        console.log(response.data.data)
        setIsSubscribed(response.data.data.isSubscribed)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }
    fetchChannelData()
  }, [video])

  const handleSubscribe = async () => {
    try {
      const data = await axios.post(`/api/v1/sub/togglesubscription/${video.owner._id}`)
      console.log("subscribe", data)
      setIsSubscribed(!isSubscribed)
      setChannelData(prev => ({
        ...prev,
        subscriberCount: isSubscribed ? prev.subscriberCount - 1 : prev.subscriberCount + 1,
        isSubscribed: !isSubscribed
      }))
    } catch (err) {
      console.error("Failed to toggle subscription:", err)
    }
  }

  const handleLike = async () => {
    try {
      await axios.post(`/api/v1/like/togglevideolike/${video._id}`)
      setIsLiked(!isLiked)
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1)
    } catch (err) {
      console.error("Failed to toggle like:", err)
    }
  }
 

  function Share(){

    const handleCopyUrl = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl)
        .then(() => {
          alert("Link copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy:", err);
        });
    }
  };

    return(
      <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 w-80 h-1/2 bg-gray-800 rounded-xl shadow-2xl p-6">
      {/* Close Button */}
      <div className="flex justify-end">
        <button
          className="w-8 h-8 flex items-center justify-center bg-red-600 text-white rounded-full hover:bg-red-700 transition duration-200"
          onClick={() => setShare(false)}
        >
          ☠️
        </button>
      </div>

      <div className="text-center text-white text-xl font-semibold mt-2 mb-6">
        Share
      </div>

      <div className="flex flex-wrap justify-center gap-6">
        <FacebookShareButton url={currentUrl}>
          <div className="bg-blue-600 rounded-full p-3 hover:bg-blue-700 transition duration-200">
            <Facebook className="text-white w-6 h-6" />
          </div>
        </FacebookShareButton>

        <EmailShareButton url={currentUrl}>
          <div className="bg-red-500 rounded-full p-3 hover:bg-red-600 transition duration-200">
            <EmailIcon className="text-white w-6 h-6" />
          </div>
        </EmailShareButton>

        <TwitterShareButton url={currentUrl}>
          <div className="bg-blue-500 rounded-full p-3 hover:bg-blue-600 transition duration-200">
             <Twitter/>
          </div>
        </TwitterShareButton>

        <WhatsappShareButton url={currentUrl}>
          <div className="bg-green-500 rounded-full p-3 hover:bg-green-600 transition duration-200">
            <Wheat/>
          </div>
        </WhatsappShareButton>

        <InstapaperShareButton url={currentUrl}>
          <div className="bg-red-500 rounded-full p-3 hover:bg-red-600 transition duration-200">
            <Instagram/>
          </div>
        </InstapaperShareButton>
       
       <LinkedinShareButton url={currentUrl}>
          <div className="bg-blue-500 rounded-full p-3 hover:bg-blue-600 transition duration-200">
            <Linkedin/>
          </div>
       </LinkedinShareButton>   
      </div>

      <div className="flex pt-5 justify-center">
        <button
          className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-200"
           onClick={handleCopyUrl}
        >
          <CopyIcon/>
        </button>
      </div>
    </div>
    )
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!channelData) return <div>No channel data found</div>

  return (
    <div className="mt-4">
      <div className="mt-2 flex flex-wrap items-center justify-between gap-y-2">
        <div className="flex items-center space-x-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={channelData.avatar} alt={channelData.fullName} />
            <AvatarFallback>{channelData.fullName[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{channelData.fullName}</p>
            <p className="text-sm text-muted-foreground">{channelData.subscriberCount} subscribers</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={channelData.isSubscribed ? "default" : "secondary"}
            onClick={handleSubscribe}
          >
            {channelData.isSubscribed ? "Subscribed" : "Subscribe"}
          </Button>
          <Button 
            variant={isLiked ? "default" : "secondary"} 
            onClick={handleLike}
          >
            <ThumbsUp className="mr-2 h-4 w-4" />
            {isLiked ? "Liked" : "Like"} {likesCount > 0 && likesCount}
          </Button>
          <Button onClick={() => setShare(true)} variant="secondary">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
         { share && <Share/>          }
      </div>
      <div className="mt-4 rounded-lg bg-muted p-4">
        <p className="text-sm">
         <p className="mb-4 text-gray-500 font-semibold">
         {video.description}
         </p>
          
          <span className="font-medium">
            Channel created on: {new Date(channelData.createdAt).toLocaleDateString()}
          </span>
        </p>
      </div>
    </div>
  )
}
