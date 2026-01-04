import { useState } from "react";
import { FileText, Play } from "lucide-react";
import { articles, videos } from "../constants/constants";
import ArticleCard from "../components/Resources/ArticleCard";
import VideoCard from "../components/Resources/VideoCard";
import VideoModal from "../components/Resources/VideoModal";

export default function Resources() {
  const [activeVideo, setActiveVideo] = useState(null);

  return (
    <div className="min-h-screen bg-white">
      {/* ARTICLES */}
      <section id="articles" className="py-20 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-16">
          <FileText className="text-blue-600" size={40} />
          <h2 className="text-4xl font-bold">Guides & Articles</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((a, i) => (
            <ArticleCard key={i} article={a} />
          ))}
        </div>
      </section>

      {/* VIDEOS */}
      <section id="video-guides" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-16">
            <Play className="text-blue-600" size={40} />
            <h2 className="text-4xl font-bold">Video Resources</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((v, i) => (
              <VideoCard key={i} video={v} onClick={setActiveVideo} />
            ))}
          </div>
        </div>
      </section>

      {activeVideo && (
        <VideoModal
          videoId={activeVideo}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </div>
  );
}
