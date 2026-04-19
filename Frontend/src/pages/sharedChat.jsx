import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSharedChat } from "../api/chat.api.js";
import Message from "../components/Chatbot_UI/Message";
import Loader from "../components/common/Loader";

const SharedChat = () => {
  const { shareToken } = useParams();
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // "not_found" | "expired" | "generic"

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const { data } = await getSharedChat(shareToken);
        setChat(data.chat);
      } catch (err) {
        const status = err.response?.status;
        if (status === 410) setError("expired");
        else if (status === 404) setError("not_found");
        else setError("generic");
      } finally {
        setLoading(false);
      }
    };
    fetchChat();
  }, [shareToken]);

  if (loading) return <Loader minHeight="min-h-screen" />;

  if (error) {
    const errorConfig = {
      not_found: {
        emoji: "🔍",
        title: "Chat not found",
        desc: "This shared link is invalid or the chat has been made private.",
      },
      expired: {
        emoji: "⏰",
        title: "Link expired",
        desc: "This shared link is no longer active.",
      },
      generic: {
        emoji: "⚠️",
        title: "Something went wrong",
        desc: "Could not load this chat. Please try again later.",
      },
    };
    const { emoji, title, desc } = errorConfig[error];

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="text-4xl mb-4">{emoji}</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
          <p className="text-sm text-gray-500 mb-6">{desc}</p>

           <a href="/"
            className="inline-block px-5 py-2 bg-[#A456F7] text-white text-sm font-medium rounded-xl hover:bg-[#9146E6] transition-colors"
          >
            Go to LawBridge
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <a href="/" className="text-lg font-bold text-gray-900 tracking-tight">
              Law<span className="text-[#A456F7]">Bridge</span>
            </a>
            {/* Divider */}
            <span className="text-gray-300">|</span>
            {/* Chat title */}
            <h1 className="text-sm sm:text-base font-medium text-gray-700 truncate max-w-[180px] sm:max-w-xs">
              {chat.title || "Untitled Chat"}
            </h1>
          </div>

          {/* Read only badge */}
          <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Read only
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Meta info */}
        <div className="text-center mb-2">
          <span className="text-xs text-gray-400">
            Shared on {new Date(chat.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>

        {chat.messages.map((message, index) => (
          <Message key={index} message={message} />
        ))}

        {/* Footer note */}
        <div className="pt-6 pb-2 text-center">
          <p className="text-xs text-gray-400">
            This is a read-only view of a shared LawBridge conversation.
          </p>
          
          <a
            href="/"
            className="inline-block mt-3 text-xs text-[#A456F7] hover:underline font-medium">
            Try LawBridge for free →
          </a>
        </div>
      </div>
    </div>
  );
};

export default SharedChat;
