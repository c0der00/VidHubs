import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { Upload, ImageIcon, Loader2 } from "lucide-react";
import newRequest from "../utils/newRequest";
import { useNavigate } from "react-router-dom";

export default function PublishPage() {
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading,setLoading] = useState(false)
  const navigate = useNavigate();

  const onVideoDrop = useCallback((acceptedFiles) => {
    setVideoFile(acceptedFiles[0]);
  }, []);

  const onThumbnailDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  }, []);

  const { getRootProps: getVideoRootProps, getInputProps: getVideoInputProps } = useDropzone({
    onDrop: onVideoDrop,
    accept: { "video/*": [] },
    multiple: false,
  });

  const { getRootProps: getThumbnailRootProps, getInputProps: getThumbnailInputProps } = useDropzone({
    onDrop: onThumbnailDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!videoFile || !thumbnailFile || !title || !description) {
      alert("Please fill in all fields and upload files.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("videoFile", videoFile); // Must match backend field
    formData.append("thumbnail", thumbnailFile); // Must match backend field
    formData.append("title", title);
    formData.append("description", description);

    try {
      const response = await newRequest.post("/api/v1/videos/publishVideo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        navigate("/"); 
      } else {
        alert("Failed to publish video.");
      }
    } catch (err) {
      console.error("Publish error:", err);
      alert("An error occurred while uploading the video.");
    } finally{
      setLoading(false)
    }
  };

  if(loading){
    return(
      <div className="fixed h-full w-full container z-50 flex justify-center items-center bg-opacity-10">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-10 w-10 text-gray-600 animate-spin"/>
           <p className="text-lg font-semibold">Publishing your video...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="pl-20 container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Publish Video</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Video Upload */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Upload Video</h2>
          <div
            {...getVideoRootProps()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
          >
            <input {...getVideoInputProps()} />
            {videoFile ? (
              <p>{videoFile.name}</p>
            ) : (
              <div>
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2">Drag and drop a video file here, or click to select</p>
              </div>
            )}
          </div>
        </div>

        {/* Thumbnail Upload */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Upload Thumbnail</h2>
          <div
            {...getThumbnailRootProps()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
          >
            <input {...getThumbnailInputProps()} />
            {thumbnailPreview ? (
              <img
                src={thumbnailPreview}
                alt="Thumbnail"
                className="mx-auto max-h-40 object-contain"
              />
            ) : (
              <div>
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2">Drag and drop an image file here, or click to select</p>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter video title"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter video description"
            rows={4}
            required
          />
        </div>

        {/* Submit */}
        <Button type="submit">Publish Video</Button>
      </form>
    </main>
  );
}
