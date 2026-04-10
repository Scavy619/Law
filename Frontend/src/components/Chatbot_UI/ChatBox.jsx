import { useEffect, useRef, useState, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import Message from "./Message";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axiosClient";
import DocumentUpload from "./DocumentUpload";

const ChatBox = () => {
  const containerRef = useRef(null);
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const {
    userData,
    sessionId: contextSessionId,
    setSessionId,
    currentSession,
    setCurrentSession,
    fetchUserChats,
    loadingResponse,
    setLoadingResponse,
    rateLimitCooldown,
    creditsExhausted,
    creditsRemaining,
    setCreditsRemaining,
    createNewChat,
    uploadingDocument,
    uploadsRemaining,
  } = useContext(AppContext);

  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);

  // Track the last failed prompt so we can offer a retry
  const [failedPrompt, setFailedPrompt] = useState(null);

  const isInputDisabled =
    loadingResponse ||
    rateLimitCooldown ||
    creditsExhausted ||
    uploadingDocument;

  // send logic
  const sendMessage = async (text) => {
    if (!text.trim()) return;

    if (!userData) {
      toast.error("Login to send message");
      return;
    }

    // Session nahi hai toh pehle banao
    let activeSessionId = contextSessionId;
    if (!activeSessionId) {
      activeSessionId = await createNewChat();
      if (!activeSessionId) {
        toast.error("Could not create chat session");
        return;
      }
      navigate(`/chatbot/${activeSessionId}`);
    }

    setFailedPrompt(null);
    setLoadingResponse(true);

    const userMessage = {
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const { data } = await api.post("/api/message/get-message", {
        message: text,
        sessionId: activeSessionId, // contextSessionId ki jagah
      });

      if (data) {
        const botMessage = {
          role: "assistant",
          content: data.response.content,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botMessage]);

        if (typeof data.creditsRemaining === "number") {
          setCreditsRemaining(data.creditsRemaining);
        }

        if (currentSession) {
          setCurrentSession({
            ...currentSession,
            messages: [
              ...(currentSession.messages || []),
              userMessage,
              botMessage,
            ],
          });
        }
      }
    } catch (error) {
      setMessages((prev) => prev.filter((m) => m !== userMessage));

      if (error.handled) {
        if (error.response?.status === 429) {
          setFailedPrompt(text);
        }
      } else {
        toast.error("Error sending message. Please try again.");
        setFailedPrompt(text);
      }
    } finally {
      setLoadingResponse(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (isInputDisabled) return;

    const text = prompt.trim();
    if (!text) return;

    setPrompt("");
    await sendMessage(text);
  };

  const onRetry = async () => {
    if (!failedPrompt || isInputDisabled) return;
    const text = failedPrompt;
    setFailedPrompt(null);
    await sendMessage(text);
  };

  // ── side effects ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (sessionId && sessionId !== contextSessionId) {
      setSessionId(sessionId);
      fetchUserChats(sessionId);
    }
  }, [sessionId]);

  useEffect(() => {
    if (currentSession?.messages) {
      setMessages(currentSession.messages);
    }
  }, [currentSession]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div className="h-full flex flex-col">
      {/* ── Messages ── */}
      <div className="flex-1 overflow-hidden flex justify-center px-4">
        <div className="w-full max-w-4xl flex flex-col h-full">
          <div
            ref={containerRef}
            className="flex-1 overflow-y-auto py-6 space-y-4"
          >
            {/* Welcome card */}
            {messages.length === 0 && (
              <div className="h-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-gray-50">
                <div className="animate-fade-in bg-white/80 backdrop-blur-sm rounded-2xl p-8 sm:p-10 md:p-12 shadow-lg border border-white/50 max-w-sm sm:max-w-md md:max-w-lg mx-auto">
                  <div className="flex justify-center mb-6">
                    <div className="relative p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                      <img
                        src={assets.legallogo}
                        alt="Law Bridge Logo"
                        className="w-16 h-16 sm:w-20 sm:h-20 object-contain opacity-90"
                      />
                    </div>
                  </div>
                  <div className="text-center space-y-3">
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      Legal Assistant
                    </h1>
                    <p className="text-gray-600 text-base sm:text-lg leading-relaxed font-medium px-2">
                      Ask your legal question and get expert assistance
                    </p>
                  </div>
                  <div className="flex justify-center mt-8">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-200 rounded-full animate-pulse" />
                      <div
                        className="w-2 h-2 bg-purple-300 rounded-full animate-pulse"
                        style={{ animationDelay: "0.2s" }}
                      />
                      <div
                        className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"
                        style={{ animationDelay: "0.4s" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Message list */}
            {messages.map((message, index) => (
              <Message key={index} message={message} />
            ))}

            {/* Thinking indicator */}
            {loadingResponse && (
              <div className="flex items-center gap-2 py-4">
                <div className="flex items-center gap-1.5 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                  <div
                    className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <span className="text-sm text-gray-500 ml-2">
                    Thinking...
                  </span>
                </div>
              </div>
            )}

            {/* Retry banner — shown after a 429 once cooldown lifts */}
            {failedPrompt && !rateLimitCooldown && !loadingResponse && (
              <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
                <span className="flex-1">
                  Message not sent due to rate limit.
                </span>
                <button
                  onClick={onRetry}
                  className="font-semibold text-amber-700 hover:text-amber-900 underline underline-offset-2 transition-colors"
                >
                  Retry
                </button>
                <button
                  onClick={() => setFailedPrompt(null)}
                  className="text-amber-400 hover:text-amber-600 transition-colors text-lg leading-none"
                  aria-label="Dismiss"
                >
                  ×
                </button>
              </div>
            )}

            {/* Credits exhausted banner */}
            {creditsExhausted && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                <span>
                  🚫 You have used all your daily credits. Chat will be
                  available again tomorrow.
                </span>
              </div>
            )}

            {/* Rate limit cooldown banner */}
            {rateLimitCooldown && !creditsExhausted && (
              <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-700">
                <span>
                  ⏳ Rate limited. Input will unlock in a few seconds...
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Input footer ── */}
      <div className="flex-shrink-0 bg-white border-t border-gray-100 p-3 sm:p-4">
        <div className="max-w-4xl mx-auto">
          {/* Top Bar Counters */}
          {!creditsExhausted &&
            (creditsRemaining !== null || uploadsRemaining !== null) && (
              <div className="flex justify-end gap-2 mb-1.5 flex-wrap">
                {uploadsRemaining !== null && (
                  <span
                    className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                      uploadsRemaining === 0
                        ? "bg-red-50 text-red-500 border border-red-200"
                        : "bg-blue-50 text-blue-600 border border-blue-200"
                    }`}
                  >
                    {uploadsRemaining} document upload
                    {uploadsRemaining !== 1 ? "s" : ""} left
                  </span>
                )}
                {creditsRemaining !== null && (
                  <span
                    className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                      creditsRemaining <= 3
                        ? "bg-red-50 text-red-500 border border-red-200"
                        : creditsRemaining <= 5
                          ? "bg-amber-50 text-amber-600 border border-amber-200"
                          : "bg-purple-50 text-purple-500 border border-purple-200"
                    }`}
                  >
                    {creditsRemaining} message
                    {creditsRemaining !== 1 ? "s" : ""} remaining today
                  </span>
                )}
              </div>
            )}

          {/* Credits exhausted — static disabled bar */}
          {creditsExhausted ? (
            <div className="bg-gray-100 border border-gray-200 rounded-2xl p-3 sm:p-4 flex items-center gap-3 opacity-60 cursor-not-allowed select-none">
              <span className="flex-1 text-sm text-gray-400">
                Daily credit limit reached. Come back tomorrow.
              </span>
            </div>
          ) : (
            <form
              onSubmit={onSubmit}
              className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 p-3 sm:p-4 flex gap-2 sm:gap-3 items-center"
            >
              {/* for docs upload */}
              <div className="flex-shrink-0 [&_span]:hidden">
                <DocumentUpload />
              </div>
              <textarea
                onChange={(e) => setPrompt(e.target.value)}
                value={prompt}
                placeholder={
                  rateLimitCooldown
                    ? "Rate limited — please wait..."
                    : "Ask your legal question..."
                }
                className="flex-1 text-sm sm:text-base text-gray-700 placeholder-gray-400 outline-none bg-transparent resize-none overflow-y-auto min-h-[40px] max-h-24 sm:max-h-32 leading-6 disabled:cursor-not-allowed"
                required
                disabled={isInputDisabled}
                rows={1}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  const maxHeight = window.innerWidth < 640 ? 96 : 128;
                  e.target.style.height =
                    Math.min(e.target.scrollHeight, maxHeight) + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSubmit(e);
                  }
                }}
              />
              <button
                disabled={isInputDisabled || !prompt.trim()}
                type="submit"
                className="flex-shrink-0 p-2.5 sm:p-3 bg-[#A456F7] hover:bg-[#9146E6] disabled:bg-gray-300 rounded-xl transition-colors duration-200 group min-w-[40px] sm:min-w-[44px]"
                title={
                  rateLimitCooldown
                    ? "Rate limited — wait a moment"
                    : creditsExhausted
                      ? "Daily credits exhausted"
                      : loadingResponse
                        ? "Waiting for response..."
                        : "Send message"
                }
              >
                <img
                  src={loadingResponse ? assets.stop_icon : assets.send_icon}
                  alt={loadingResponse ? "loading" : "send"}
                  className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-105 transition-transform duration-200 mx-auto"
                />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
