import VideoThumbnail from "./VideoThumbnail";
import { Video } from "lucide-react";

const getVideoId = (url) => url.split("v=")[1]?.split("&")[0];

export default function VideoCard({ video, onClick }) {
  const videoId = getVideoId(video.url);

  return (
    <div
      onClick={() => onClick(videoId)}
      className="bg-white rounded-3xl border-2 border-gray-300 overflow-hidden hover:shadow-xl hover:border-blue-500 hover:-translate-y-2 transition-all duration-300 cursor-pointer"
    >
      <VideoThumbnail videoId={videoId} />

      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{video.title}</h3>
        <p className="text-gray-600 mb-4">{video.description}</p>
        <div className="flex items-center gap-2 text-gray-500">
          <Video className="w-4 h-4" />
          <span className="text-sm">{video.channel}</span>
        </div>
      </div>
    </div>
  );
}
