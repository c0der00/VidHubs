import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { ThumbsUp, Trash2, Edit2 } from "lucide-react"
import { useState, useEffect, useRef, useCallback } from "react"
import axios from "axios"
import { useSelector } from "react-redux"

export function CommentSection({ video }) {
  const { data } = useSelector(state => state.auth)
  
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editContent, setEditContent] = useState("")
  const observer = useRef()
  const didCancel = useRef(false)

  const lastCommentElementRef = useCallback(node => {
    if (loading) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1)
      }
    })
    if (node) observer.current.observe(node)
  }, [loading, hasMore])

  const fetchComments = useCallback(async (videoId, currentPage) => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/v1/comments/getvideocomments/${videoId}?page=${currentPage}`)
      const newComments = response.data.data.comments
      const { hasNextPage } = response.data.data.pagination

      if (didCancel.current) return

      setComments(prev => currentPage === 1 ? newComments : [...prev, ...newComments])
      setHasMore(hasNextPage)
      setLoading(false)
    } catch (err) {
      if (!didCancel.current) {
        setError(err.message || "Failed to load comments")
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    didCancel.current = false
    setComments([])
    setPage(1)
    setHasMore(true)
    fetchComments(video._id, 1)
    return () => {
      didCancel.current = true
    }
  }, [video._id, fetchComments])

  useEffect(() => {
    if (page !== 1) {
      fetchComments(video._id, page)
    }
  }, [page, video._id, fetchComments])

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    try {
      await axios.post(`/api/v1/comments/addcomment/${video._id}`, {
        content: newComment
      })
      const commentResponse = await axios.get(`/api/v1/comments/getvideocomments/${video._id}?page=1&limit=1`)
      console.log('comment',commentResponse);
      
      const newCommentData = commentResponse.data.data.comments[0]
      setComments(prevComments => [newCommentData, ...prevComments])
      setNewComment("")
    } catch (err) {
      console.error("Failed to add comment:", err)
    }
  }

  const handleToggleLike = async (commentId, index) => {
    try {
      await axios.post(`/api/v1/like/togglecommentlike/${commentId}`)
      setComments(prev => {
        const updated = [...prev]
        const comment = { ...updated[index] }
        comment.isLiked = !comment.isLiked
        comment.countLikes = comment.isLiked
          ? comment.countLikes + 1
          : comment.countLikes - 1
        updated[index] = comment
        return updated
      })
    } catch (err) {
      console.error("Failed to toggle like:", err)
    }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.post(`/api/v1/comments/deletecomment/${commentId}`)
      setComments(prev => prev.filter(comment => comment._id !== commentId))
    } catch (err) {
      console.error("Failed to delete comment:", err)
    }
  }

  const handleEditComment = async (commentId) => {
    if (!editContent.trim()) return
    try {
      await axios.post(`/api/v1/comments/updatecomment/${commentId}`, {
        content: editContent
      })
      setComments(prev =>
        prev.map(comment =>
          comment._id === commentId
            ? { ...comment, content: editContent }
            : comment
        )
      )
      setEditingCommentId(null)
      setEditContent("")
    } catch (err) {
      console.error("Failed to update comment:", err)
    }
  }

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold">Comments</h2>
      <div className="mt-4 flex space-x-4">
        <Avatar>
          <AvatarImage src={data?.avatar} alt={data?.fullName} />
          <AvatarFallback>{data?.fullName?.[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <div className="mt-2 flex justify-end space-x-2">
            <Button variant="ghost" onClick={() => setNewComment("")}>Cancel</Button>
            <Button onClick={handleAddComment}>Comment</Button>
          </div>
        </div>
      </div>
      <div className="mt-6 space-y-4">
        {console.log(comments,"ssrgssssssssssssssssssssssssssssssssssssssss")  }      
        {comments.map((comment, index) => (
          <div
            key={comment._id}
            ref={index === comments.length - 1 ? lastCommentElementRef : null}
            className="flex space-x-4"
          > {console.log(comment.owner._id)}
            <Avatar>
              <AvatarImage src={comment.owner.avatar} alt={comment.owner.fullName} />
              <AvatarFallback>{comment.owner.fullName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <p className="text-sm font-semibold">
                {comment.owner.fullName}
                <span className="font-normal text-muted-foreground ml-2">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </p>
              {editingCommentId === comment._id ? (
                <div className="mt-1">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="mb-2"
                  />
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" onClick={() => {
                      setEditingCommentId(null)
                      setEditContent("")
                    }}>
                      Cancel
                    </Button>
                    <Button onClick={() => handleEditComment(comment._id)}>Save</Button>
                  </div>
                </div>
              ) : (
                <p className="mt-1">{comment.content}</p>
              )}
              <div className="mt-1 flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`${comment.isLiked ? 'text-blue-600' : ''}`}
                  onClick={() => handleToggleLike(comment._id, index)}
                >{console.log('sdsd',data)}
                {console.log('sdsd',comment.owner)}
                
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  {comment.countLikes}
                </Button>
                {data?._id === comment.owner._id && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingCommentId(comment._id)
                        setEditContent(comment.content)
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteComment(comment._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-500">Error: {error}</div>}
        {!hasMore && !loading && <div className="text-gray-500 text-sm text-center">No more comments.</div>}
      </div>
    </div>
  )
}
