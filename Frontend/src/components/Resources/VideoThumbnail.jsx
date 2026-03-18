import { Play } from "lucide-react";

export default function VideoThumbnail({ videoId }) {
  return (
    <div className="relative aspect-video overflow-hidden shrink-0 bg-gray-100">
      <img
        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
        alt="Video thumbnail"
        loading="lazy"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-white/90 shadow-lg flex items-center justify-center group-hover:scale-110 group-hover:bg-[#5f6FFF] transition-all duration-300">
          <Play className="w-5 h-5 text-[#5f6FFF] group-hover:text-white fill-[#5f6FFF] group-hover:fill-white ml-0.5 transition-colors duration-300" />
        </div>
      </div>
    </div>
  );
}
