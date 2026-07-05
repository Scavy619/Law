import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Scale, Info, MessageCircle } from "lucide-react";
import { lawSections, lawCategories, disclaimer } from "../../constants/lawSections";
import { whatsappLink } from "../../siteConfig";

const LawSectionSearch = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return lawSections.filter((entry) => {
      const matchesCategory = category === "All" || entry.category === category;
      if (!matchesCategory) return false;
      if (!q) return true;
      const haystack = [
        entry.title,
        entry.section,
        entry.oldRef,
        entry.act,
        entry.summary,
        ...(entry.keywords || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query, category]);

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          Search Indian Law Sections
        </h2>
        <p className="text-gray-500 text-sm md:text-base max-w-2xl mx-auto">
          Look up a section by number, offence name, or plain-English keyword —
          covers the Bharatiya Nyaya Sanhita (BNS) 2023, cross-referenced against
          the old IPC, plus key Constitutional articles.
        </p>
      </div>

      {/* Search + Filter */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5 shadow-sm mb-6">
        <div className="relative mb-3">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Try "420", "murder", "dowry", "rape", "Article 21"...'
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {lawCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`text-xs md:text-sm px-3 py-1.5 rounded-full border transition-colors ${
                category === cat
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-600 border-gray-200 hover:border-primary/40"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="mb-4 text-sm text-gray-500">
        {results.length} {results.length === 1 ? "section" : "sections"} found
      </div>

      <div className="space-y-4 mb-8">
        {results.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
            <Scale className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium mb-1">No matching sections found</p>
            <p className="text-gray-500 text-sm mb-4">
              This is a curated reference, not a full legal database — your situation
              may involve a section that isn't listed here.
            </p>
            <a
              href={whatsappLink("Hi Shivam, I couldn't find the section I was looking for on your site — can you help?")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
            >
              <MessageCircle className="w-4 h-4" />
              Ask directly on WhatsApp
            </a>
          </div>
        ) : (
          results.map((entry) => (
            <div
              key={`${entry.act}-${entry.section}`}
              className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 hover:border-primary/30 hover:shadow-md transition-all duration-300"
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                  {entry.act} &middot; Section {entry.section}
                </span>
                {entry.oldRef && (
                  <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
                    formerly {entry.oldRef}
                  </span>
                )}
                <span className="text-xs text-gray-400">{entry.category}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1.5">{entry.title}</h3>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">{entry.summary}</p>
            </div>
          ))
        )}
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-3 mb-6">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-amber-800 text-sm leading-relaxed">{disclaimer}</p>
      </div>

      <div className="text-center bg-gradient-to-br from-primary/5 to-fuchsia-500/5 border-2 border-primary/10 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Not sure which section applies to you?
        </h3>
        <p className="text-gray-600 mb-6 max-w-xl mx-auto">
          That's normal — section numbers rarely tell the whole story. Send a message and let's work out what actually matters for your situation.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-full font-semibold hover:bg-[#20bd5a] transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Chat on WhatsApp
          </a>
          <Link
            to="/chatbot"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-primary text-primary rounded-full font-semibold hover:bg-primary/5 transition-colors"
          >
            Ask the AI Assistant
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LawSectionSearch;
