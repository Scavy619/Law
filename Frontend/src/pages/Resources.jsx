import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FileText,
  Play,
  Search,
  Scale,
  Video,
  ChevronRight,
} from "lucide-react";
import { articles, videos } from "../constants/constants";
import ArticleCard from "../components/Resources/ArticleCard";
import VideoCard from "../components/Resources/VideoCard";
import VideoModal from "../components/Resources/VideoModal";
import LawSectionSearch from "../components/Resources/LawSectionSearch";
import useApp from "../context/useApp";

const ALL = "All";

const categoryColors = {
  "Constitutional Law": {
    bg: "bg-violet-100",
    text: "text-violet-700",
    border: "border-violet-200",
    dot: "bg-violet-500",
  },
  "Family Law": {
    bg: "bg-rose-100",
    text: "text-rose-700",
    border: "border-rose-200",
    dot: "bg-rose-500",
  },
};

export default function Resources() {
  const [searchParams] = useSearchParams();
  const [activeVideo, setActiveVideo] = useState(null);
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") === "law" ? "law" : "articles",
  );
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(ALL);
  const { lawyers } = useApp();
  const bookingPath = lawyers?.[0]?._id ? `/appointment/${lawyers[0]._id}` : "/lawyers";

  useEffect(() => {
    if (searchParams.get("tab") === "law") setActiveTab("law");
  }, [searchParams]);

  const categories = useMemo(
    () => [ALL, ...new Set(articles.map((a) => a.category))],
    []
  );

  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      const matchCat =
        activeCategory === ALL || a.category === activeCategory;
      const matchSearch =
        !search ||
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [search, activeCategory]);

  const filteredVideos = useMemo(() => {
    return videos.filter(
      (v) =>
        !search ||
        v.title.toLowerCase().includes(search.toLowerCase()) ||
        v.description.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);



  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Page Header ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-8 md:py-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Resources</h1>
          <div className="w-20 h-1 bg-primary mx-auto rounded-full mb-4" />
          <p className="text-gray-500 text-sm md:text-base max-w-xl mx-auto">
            Curated articles, video lectures, and legal references — all completely free.
          </p>
        </div>

        {/* Search */}
        {activeTab !== "law" && (
          <div className="relative max-w-xl mx-auto mb-10">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles, topics, or videos…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-gray-200 text-gray-800 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-gray-400 transition-all"
            />
          </div>
        )}
      </div>

      {/* ── Tab Navigation ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-12">
        <div className="flex flex-wrap items-center justify-center gap-2 bg-white border border-gray-200 rounded-2xl p-1.5 shadow-sm w-fit mx-auto">
          <button
            onClick={() => setActiveTab("articles")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
              activeTab === "articles"
                ? "bg-[#9333EA] text-white shadow-md"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <FileText className="w-4 h-4" />
            Articles
          </button>
          <button
            onClick={() => setActiveTab("videos")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
              activeTab === "videos"
                ? "bg-[#9333EA] text-white shadow-md"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <Play className="w-4 h-4" />
            Videos
          </button>
          <button
            onClick={() => setActiveTab("law")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
              activeTab === "law"
                ? "bg-[#9333EA] text-white shadow-md"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <Scale className="w-4 h-4" />
            Law Search
          </button>
        </div>
      </section>

      {/* ── Articles Section ── */}
      {activeTab === "articles" && (
        <section id="articles" className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Guides &amp; Articles
              </h2>
              <p className="text-gray-500 mt-1 text-sm">
                {filteredArticles.length} resource
                {filteredArticles.length !== 1 ? "s" : ""} found
              </p>
            </div>
            {/* Category filter pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const color = cat === ALL ? null : categoryColors[cat];
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                      isActive && cat === ALL
                        ? "bg-[#9333EA] text-white border-[#9333EA] shadow-md"
                        : !isActive && cat === ALL
                        ? "bg-white text-gray-600 border-gray-300 hover:border-[#9333EA] hover:text-[#9333EA]"
                        : isActive && color
                        ? `${color.bg} ${color.text} ${color.border} shadow-md`
                        : color
                        ? `bg-white ${color.text} ${color.border} hover:${color.bg}`
                        : "bg-white text-gray-600 border-gray-300"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {filteredArticles.length === 0 ? (
            <EmptyState type="articles" />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((a, i) => (
                <ArticleCard key={i} article={a} categoryColors={categoryColors} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Videos Section ── */}
      {activeTab === "videos" && (
        <section
          id="video-guides"
          className="max-w-7xl mx-auto px-4 sm:px-6 py-12"
        >
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Video Resources
            </h2>
            <p className="text-gray-500 mt-1 text-sm">
              {filteredVideos.length} video
              {filteredVideos.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {filteredVideos.length === 0 ? (
            <EmptyState type="videos" />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((v, i) => (
                <VideoCard key={i} video={v} onClick={setActiveVideo} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Law Search Section ── */}
      {activeTab === "law" && (
        <section id="law-search" className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <LawSectionSearch />
        </section>
      )}

      {/* ── CTA Banners ── */}
      {activeTab !== "law" && (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid sm:grid-cols-2 gap-5">

          {/* Card 1 — Find a Lawyer */}
          <div className="relative bg-[#9333EA] rounded-3xl p-7 sm:p-8 text-white overflow-hidden">
            <div className="relative flex flex-col h-full gap-5">

              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Need legal advice?</h3>
                <p className="text-white/80 text-sm leading-relaxed mb-2">
                  Reading about the law is a great first step — but every situation is unique.
                  Book a consultation to talk through your specific case in criminal, family,
                  property, corporate, civil, or tax matters.
                </p>
              </div>
              <a
                href={bookingPath}
                className="self-start flex items-center gap-2 bg-white text-[#9333EA] font-bold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-sm whitespace-nowrap"
              >
                Book a Consultation
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Card 2 — Courses (Coming Soon) */}
          <div className="relative bg-[#7c3aed] rounded-3xl p-7 sm:p-8 text-white overflow-hidden">
            <div className="relative flex flex-col h-full gap-5">
              <span className="text-xs font-bold bg-yellow-400 text-yellow-900 px-2.5 py-1 rounded-full tracking-wide w-fit">
                COMING SOON
              </span>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1.5">Legal Courses</h3>
                <p className="text-white/75 text-sm leading-relaxed">
                  Structured legal courses taught by experts — from constitutional rights to property law and beyond.
                </p>
              </div>
              <button
                disabled
                className="self-start flex items-center gap-2 bg-white/20 text-white font-bold px-5 py-2.5 rounded-xl text-sm whitespace-nowrap cursor-not-allowed border border-white/30"
              >
                Browse Courses
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </section>
      )}

      {/* ── Modal ── */}
      {activeVideo && (
        <VideoModal videoId={activeVideo} onClose={() => setActiveVideo(null)} />
      )}
    </div>
  );
}

function EmptyState({ type }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#9333EA]/10 flex items-center justify-center mb-4">
        {type === "articles" ? (
          <FileText className="w-8 h-8 text-[#9333EA]" />
        ) : (
          <Play className="w-8 h-8 text-[#9333EA]" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-1">
        No {type} found
      </h3>
      <p className="text-gray-400 text-sm">Try adjusting your search or filter.</p>
    </div>
  );
}
