export default function VideoThumbnail({ videoId }) {
  return (
    <div className="relative aspect-video overflow-hidden border-b-2 border-gray-200">
      <img
        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
        alt="Video thumbnail"
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-300"
      />
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
        <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
          ▶
        </div>
      </div>
    </div>
  );
}
