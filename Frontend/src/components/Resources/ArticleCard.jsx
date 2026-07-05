import { Clock, ExternalLink, BookOpen } from "lucide-react";

export default function ArticleCard({ article, categoryColors }) {
  const color = categoryColors?.[article.category];

  return (
    <div
      onClick={() => window.open(article.url, "_blank")}
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col"
    >
      {/* Thumbnail */}
      <div className="relative h-44 overflow-hidden shrink-0">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Category badge */}
        {color && (
          <span
            className={`absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 ${color.bg} ${color.text} text-xs font-semibold rounded-full border ${color.border} backdrop-blur-sm`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
            {article.category}
          </span>
        )}

        {/* Read time badge */}
        <span className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-black/60 text-white text-xs rounded-full backdrop-blur-sm">
          <Clock className="w-3 h-3" />
          {article.readTime}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="text-base font-bold text-gray-800 mb-2 leading-snug group-hover:text-[#9333EA] transition-colors duration-200 line-clamp-2">
          {article.title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 flex-1">
          {article.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-gray-400">
            <BookOpen className="w-4 h-4" />
            <span className="text-xs font-medium text-gray-500">
              {article.source}
            </span>
          </div>

          <span className="flex items-center gap-1.5 text-xs font-semibold text-[#9333EA] opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-200">
            Read more
            <ExternalLink className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}
