import { Button } from "./ui/button"
import { Edit2, ThumbsUp, ThumbsUpIcon, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import axios from "axios"
import { useSelector } from "react-redux"
import { Textarea } from "./ui/textarea"

export function TweetList({ channelId }) {
  const { data } = useSelector(state => state.auth)
  const [tweets, setTweets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editContent,setEditContent] = useState("");
  const [editingTweetId,setEditingTweetId] = useState(null)

  useEffect(() => {
    const fetchTweets = async () => {
      try {
        const response = await axios.get(`/api/v1/tweet/getusertweets/${channelId}`)
        setTweets(response.data.data)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    fetchTweets()
  }, [channelId])

  const handleLikeToggle = async (tweetId) => {
    try {
      await axios.post(`/api/v1/like/toggletweetlike/${tweetId}`)
      setTweets(prevTweets => 
        prevTweets.map(tweet => {
          if (tweet._id === tweetId) {
            return {
              ...tweet,
              isLiked: !tweet.isLiked,
              likesCount: tweet.isLiked ? tweet.likesCount - 1 : tweet.likesCount + 1
            }
          }
          return tweet
        })
      )
    } catch (err) {
      console.error("Failed to toggle like:", err)
    }
  }

  const handleDeleteTweet = async(tweetId) => {
    try {
      await axios.post(`/api/v1/tweet/deletetweet/${tweetId}`)
      setTweets(prev => prev.filter(tweet => tweet._id !== tweetId))
    } catch (err) {
      console.error("Failed to delete comment:", err)
    }
  }

  const handleEditTweet = async(tweetId) => {
    if(! editContent.trim()) return
    try {
      await axios.post(`/api/v1/tweet/updatetweet/${tweetId}`,{content : editContent})
      setTweets(prev => prev.map(tweet => tweet._id === tweetId ? 
        {...tweet,content : editContent}
      : tweet))
      setEditingTweetId(null)
      setEditContent("")
    } catch (err) {
      console.error("Failed to update comment:", err)
    }
  }

  if (loading) return <div>Loading tweets...</div>
  if (error) return <div>Error: {error}</div>
  if (!tweets.length) return <div>No tweets found</div>

  return (
    <div className="space-y-4">
      {tweets.map((tweet) => (
        <div key={tweet._id} className="bg-muted p-4 rounded-lg">
          
          {editingTweetId === tweet._id ? (
                <div className="mt-1">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="mb-2"
                  />
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" onClick={() => {
                      setEditingTweetId(null)
                      setEditContent("")
                    }}>
                      Cancel
                    </Button>
                    <Button onClick={() => handleEditTweet(tweet._id)}>Save</Button>
                  </div>
                </div>
              ): <p>{tweet.content}</p>}
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-muted-foreground">
              {new Date(tweet.createdAt).toLocaleDateString()}
            </p>{console.log(editingTweetId)}
            
            {data?.user?._id === tweet.owner && (
              <>
              <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingTweetId(tweet._id)
                        setEditContent(tweet.content)
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                </Button>
              <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteTweet(tweet._id)}
            >
              <Trash2 className="h-4 w-4" />
              </Button>
              </>)
            }
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleLikeToggle(tweet._id)}
            >
              {tweet.isLiked ? (
                <ThumbsUpIcon className="h-4 w-4 mr-2 text-primary fill-primary" />
              ) : (
                <ThumbsUp className="h-4 w-4 mr-2" />
              )}
              {tweet.likesCount}
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
