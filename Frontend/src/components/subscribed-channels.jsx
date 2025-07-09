import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { useState, useEffect } from "react"
import axios from "axios"

export function SubscribedChannels({ channelId }) {
  const [subscribedChannels, setSubscribedChannels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSubscribedChannels = async () => {
      try {
        const response = await axios.get(`/api/v1/sub/getsubscribedchannels/${channelId}`)
        console.log(response.data);
        
        setSubscribedChannels(response.data.data)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    fetchSubscribedChannels()
  }, [channelId])

  if (loading) return <div>Loading subscribed channels...</div>
  if (error) return <div>Error: {error}</div>
  if (!subscribedChannels.length) return <div>No subscribed channels found</div>

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {subscribedChannels.map((channel) => (
        <div key={channel._id} className="flex items-center space-x-4">
          <Avatar>{console.log(channel.channel[0].fullName)}
            <AvatarImage src={channel.channel[0].avatar} alt={channel.channel[0].fullName} />
            <AvatarFallback>{channel.channel[0].fullName}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{channel.channel[0].fullName}</h3>
            <p className="text-sm text-muted-foreground">{channel.subscriberCount} subscribers</p>
          </div>
        </div>
      ))}
    </div>
  )
}
