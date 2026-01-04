import { Clock, ExternalLink, User } from "lucide-react";

export default function ArticleCard({ article }) {
  return (
    <div
      onClick={() => window.open(article.url, "_blank")}
      className="group bg-white rounded-3xl border-2 border-gray-300 overflow-hidden hover:shadow-xl hover:border-blue-500 hover:-translate-y-2 transition-all duration-300 cursor-pointer"
    >
      <div className="relative h-48">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 border-b-2 border-gray-200"
          loading="lazy"
        />

        <span className="absolute top-3 left-3 px-3 py-1 bg-white text-xs font-bold rounded-full">
          {article.category}
        </span>

        <span className="absolute top-3 right-3 px-2 py-1 bg-black/70 text-white text-xs rounded-full flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {article.readTime}
        </span>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600">
          {article.title}
        </h3>

        <p className="text-gray-600 mb-4 line-clamp-3">{article.description}</p>

        <div className="flex justify-between items-center pt-3 border-t">
          <div className="flex items-center gap-2 text-gray-500">
            <User className="w-4 h-4" />
            <span className="text-sm">{article.source}</span>
          </div>

          <ExternalLink className="w-4 h-4 text-blue-600" />
        </div>
      </div>
    </div>
  );
}
