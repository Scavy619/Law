import VideoThumbnail from "./VideoThumbnail";
import { Tv2 } from "lucide-react";

const getVideoId = (url) => url.split("v=")[1]?.split("&")[0];

export default function VideoCard({ video, onClick }) {
  const videoId = getVideoId(video.url);

  return (
    <div
      onClick={() => onClick(videoId)}
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col"
    >
      <VideoThumbnail videoId={videoId} />

      <div className="flex flex-col flex-1 p-5">
        <h3 className="text-base font-bold text-gray-800 mb-2 leading-snug group-hover:text-[#5f6FFF] transition-colors duration-200 line-clamp-2">
          {video.title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 flex-1">
          {video.description}
        </p>

        <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Tv2 className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-medium text-gray-500">
              {video.channel}
            </span>
          </div>
          <span className="flex items-center gap-1 text-xs font-semibold text-[#5f6FFF] bg-[#5f6FFF]/10 px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            ▶ Play
          </span>
        </div>
      </div>
    </div>
  );
}
