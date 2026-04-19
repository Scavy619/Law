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

  // Share/export state
  const [shareUrl, setShareUrl] = useState(null);
  const [isShared, setIsShared] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [showSharePopover, setShowSharePopover] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);

  const {
    userData,
    authLoading,
    sessionId,
    setSessionId,
    currentSession,
    fetchUserChats,
    createNewChat,
  } = useApp();

  const handleExport = async (format) => {
    if (!sessionId) return toast.error("No active chat to export");
    setShowExportMenu(false);
    try {
      const res = await exportSingleChat(sessionId, format);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `lawbridge-chat-${Date.now()}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Export failed");
    }
  };

  const handleShare = async () => {
    if (!sessionId) return toast.error("No active chat to share");
    setShareLoading(true);
    try {
      if (isShared) {
        await unshareChat(sessionId);
        setIsShared(false);
        setShareUrl(null);
        setShowSharePopover(false);
        toast.success("Chat is now private");
      } else {
        const { data } = await shareChat(sessionId);
        setIsShared(true);
        setShareUrl(data.shareUrl);
        setShowSharePopover(true);
        toast.success("Chat is now public");
      }
    } catch {
      toast.error("Failed to update share settings");
    } finally {
      setShareLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied!");
  };

  // Jab session badle toh share state reset karo
  useEffect(() => {
    setIsShared(false);
    setShareUrl(null);
    setShowSharePopover(false);
    setShowExportMenu(false);
  }, [sessionId]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    if (urlSessionId && urlSessionId !== sessionId) {
      setSessionId(urlSessionId);
      if (userData) {
        fetchUserChats(urlSessionId);
      }
    }
  }, [urlSessionId, userData, sessionId, setSessionId, fetchUserChats]);

  useEffect(() => {
    if (!authLoading && !userData) {
      toast.error("Please login to access chatbot");
      navigate("/login");
    }
  }, [authLoading, userData, navigate]);

  if (authLoading) {
    return <Loader minHeight="min-h-screen" />;
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please login to access the legal chatbot</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Fixed Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-80 z-30 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      </div>

      {/* Main Chat Container */}
      <div
        className={`flex-1 flex flex-col h-screen transition-all duration-300 ease-in-out ${
          isMenuOpen ? "md:ml-80" : "ml-0"
        }`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="fixed top-3 left-3 sm:top-4 sm:left-4 z-40 p-2.5 sm:p-3 bg-white border border-gray-200 text-gray-700 rounded-xl shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-3 sm:px-6 py-3 sm:py-4 shadow-sm">
          <div className="flex items-center justify-between gap-2 sm:gap-4 max-w-4xl mx-auto">

            {/* Left — title */}
            <div className="text-left pl-12 sm:pl-0 min-w-0 flex-1">
              <h1 className="text-base sm:text-xl font-semibold text-gray-900 truncate">Legal Assistant</h1>
              <p className="hidden sm:block text-sm text-gray-500 mt-1">
                {currentSession ? "Active Session" : "Start a new legal consultation"}
              </p>
            </div>

            {/* Right — actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 max-[420px]:w-full max-[420px]:pl-12 max-[420px]:justify-end">

              {/* Action buttons — sirf tab jab session ho */}
              {sessionId && (
                <div className="flex items-center gap-1.5 sm:gap-2">

                  {/* Export dropdown */}
                  <div ref={exportMenuRef} className="relative max-[350px]:hidden">
                    <button
                      type="button"
                      onClick={() => setShowExportMenu((prev) => !prev)}
                      className="flex items-center gap-1 sm:gap-1.5 px-2 py-2 sm:px-3 sm:py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      title="Export"
                      aria-label="Export chat"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span className="hidden sm:inline">Export</span>
                    </button>
                    {showExportMenu && (
                      <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                      <button
                        type="button"
                        onClick={() => handleExport("pdf")}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-t-xl transition-colors"
                      >
                        Export as PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExport("json")}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-b-xl transition-colors"
                      >
                        Export as JSON
                      </button>
                      </div>
                    )}
                  </div>

                  {/* Share button + popover */}
                  <div className="relative">
                    <button
                      onClick={handleShare}
                      disabled={shareLoading}
                      title={isShared ? "Shared chat" : "Share chat"}
                      aria-label={isShared ? "Shared chat" : "Share chat"}
                      className={`flex items-center gap-1 sm:gap-1.5 px-2 py-2 sm:px-3 sm:py-1.5 text-sm border rounded-lg transition-colors ${
                        isShared
                          ? "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                          : "text-gray-600 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      <span className="inline text-xs sm:text-sm">
                        {shareLoading ? "..." : isShared ? "Shared" : "Share"}
                      </span>
                    </button>

                    {/* Popover */}
                    {isShared && shareUrl && showSharePopover && (
                      <div className="absolute right-0 top-full mt-1 w-[min(18rem,calc(100vw-1rem))] bg-white border border-gray-200 rounded-xl shadow-lg p-3 z-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-700">Shareable link</span>
                          <button
                            onClick={() => setShowSharePopover(false)}
                            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                          >×</button>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                          <span className="text-xs text-gray-600 truncate flex-1">{shareUrl}</span>
                          <button
                            onClick={handleCopyLink}
                            className="text-xs text-purple-600 font-medium hover:text-purple-800 flex-shrink-0"
                          >
                            Copy
                          </button>
                        </div>
                        <button
                          onClick={handleShare}
                          className="mt-2 w-full text-xs text-red-500 hover:text-red-700 text-center transition-colors"
                        >
                          Make private
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>

        {/* ChatBox */}
        <div className="flex-1 overflow-hidden bg-gray-50">
          <ChatBox />
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
