import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useApp from "../context/useApp";
import Sidebar from "../components/Chatbot_UI/Sidebar";
import ChatBox from "../components/Chatbot_UI/ChatBox";
import { toast } from "react-toastify";
import Loader from "../components/common/Loader";
import { exportSingleChat, shareChat, unshareChat } from "../api/chat.api.js";

const Chatbot = () => {
  const { sessionId: urlSessionId } = useParams();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState(null);
  const [isShared, setIsShared] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [showSharePopover, setShowSharePopover] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);
  const sharePopoverRef = useRef(null);

  const {
    userData,
    authLoading,
    sessionId,
    setSessionId,
    currentSession,
    fetchUserChats,
  } = useApp();

  const handleExport = async (format) => {
    if (!sessionId) return toast.error("No active chat to export");
    setShowExportMenu(false);
    try {
      const res = await exportSingleChat(sessionId, format);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `legal-chat-${Date.now()}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Export failed");
    }
  };

  const handleShare = async () => {
    if (!sessionId) return toast.error("No active chat to share");
    if (isShared) {
      setShowSharePopover(true);
      return;
    }
    setShareLoading(true);
    try {
      const { data } = await shareChat(sessionId);
      setIsShared(true);
      setShareUrl(data.shareUrl);
      setShowSharePopover(true);
      toast.success("Chat is now public");
    } catch {
      toast.error("Failed to share chat");
    } finally {
      setShareLoading(false);
    }
  };

  const handleUnshare = async () => {
    if (!sessionId) return;
    setShareLoading(true);
    try {
      await unshareChat(sessionId);
      setIsShared(false);
      setShareUrl(null);
      setShowSharePopover(false);
      toast.success("Chat is now private");
    } catch {
      toast.error("Failed to make chat private");
    } finally {
      setShareLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied!");
  };

  useEffect(() => {
    setIsShared(false);
    setShareUrl(null);
    setShowSharePopover(false);
    setShowExportMenu(false);
  }, [sessionId]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target))
        setShowExportMenu(false);
      if (
        sharePopoverRef.current &&
        !sharePopoverRef.current.contains(e.target)
      )
        setShowSharePopover(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    if (urlSessionId && urlSessionId !== sessionId) {
      setSessionId(urlSessionId);
      if (userData) fetchUserChats(urlSessionId);
    }
  }, [urlSessionId, userData]);

  useEffect(() => {
    if (!authLoading && !userData) {
      toast.error("Please login to access chatbot");
      navigate("/login");
    }
  }, [authLoading, userData]);

  const chatDateSource = currentSession?.createdAt || currentSession?.updatedAt;
  const chatDate = chatDateSource ? new Date(chatDateSource) : null;
  const hasValidChatDate =
    chatDate instanceof Date && !Number.isNaN(chatDate.getTime());
  const chatDateFallback = hasValidChatDate
    ? `Chat — ${chatDate.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`
    : "New Legal Chat";

  const MAX_HEADER_TITLE_CHARS = 32;
  const title = currentSession?.title?.trim() || "";
  const titleFirstThreeWords = title
    ? title.split(/\s+/).slice(0, 3).join(" ")
    : "";
  const truncatedTitle =
    titleFirstThreeWords.length > MAX_HEADER_TITLE_CHARS
      ? `${titleFirstThreeWords.slice(0, MAX_HEADER_TITLE_CHARS).trimEnd()}...`
      : titleFirstThreeWords;

  const chatHeaderTitle = truncatedTitle || chatDateFallback;

  if (authLoading) return <Loader minHeight="min-h-screen" />;
  if (!userData) return null;

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-gray-50">
      {/* Overlay — sidebar open hone pe background dim */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-72 z-30 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col h-[100dvh] min-w-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 shadow-sm flex-shrink-0">
          <div className="flex items-center h-14 px-3 gap-2">
            {/* Hamburger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex-shrink-0 p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>

            {/* Title — flex-1 so it takes remaining space */}
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-semibold text-gray-900 truncate">
                {chatHeaderTitle}
              </h1>
              {currentSession && (
                <p className="text-xs text-gray-400 truncate hidden sm:block">
                  Active Session
                </p>
              )}
            </div>

            {/* Actions — fixed width, never shrink */}
            {sessionId && (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {/* Export */}
                <div ref={exportMenuRef} className="relative">
                  <button
                    onClick={() => setShowExportMenu((p) => !p)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs md:gap-1.5 md:px-3.5 md:py-2 md:text-sm text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
                    aria-label="Export"
                  >
                    <svg
                      className="w-3.5 h-3.5 md:w-4 md:h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    <span className="hidden md:inline">Export</span>
                  </button>
                  {showExportMenu && (
                    <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                      <button
                        onClick={() => handleExport("pdf")}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-t-xl"
                      >
                        Export as PDF
                      </button>
                      <button
                        onClick={() => handleExport("json")}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-b-xl"
                      >
                        Export as JSON
                      </button>
                    </div>
                  )}
                </div>

                {/* Share */}
                <div ref={sharePopoverRef} className="relative">
                  <button
                    onClick={handleShare}
                    disabled={shareLoading}
                    className={`flex items-center gap-1 px-2.5 py-1.5 text-xs md:gap-1.5 md:px-3.5 md:py-2 md:text-sm border rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                      isShared
                        ? "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                    }`}
                  >
                    {shareLoading ? (
                      <svg
                        className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-3.5 h-3.5 md:w-4 md:h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                      </svg>
                    )}
                    <span className="hidden md:inline">
                      {shareLoading
                        ? "Sharing…"
                        : isShared
                          ? "Shared"
                          : "Share"}
                    </span>
                  </button>

                  {isShared && shareUrl && showSharePopover && (
                    <div
                      className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-3 z-50"
                      style={{ width: "min(280px, calc(100vw - 24px))" }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-700">
                          Shareable link
                        </span>
                        <button
                          onClick={() => setShowSharePopover(false)}
                          className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                        >
                          ×
                        </button>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                        <span className="text-xs text-gray-600 truncate flex-1">
                          {shareUrl}
                        </span>
                        <button
                          onClick={handleCopyLink}
                          className="text-xs text-purple-600 font-medium hover:text-purple-800 flex-shrink-0"
                        >
                          Copy
                        </button>
                      </div>
                      <button
                        onClick={handleUnshare}
                        disabled={shareLoading}
                        className="mt-2 w-full text-xs text-red-500 hover:text-red-700 text-center disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                      >
                        {shareLoading ? (
                          <>
                            <svg
                              className="w-3 h-3 animate-spin"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                              />
                            </svg>
                            Making private…
                          </>
                        ) : (
                          "Make private"
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ChatBox */}
        <div className="flex-1 overflow-hidden">
          <ChatBox />
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
