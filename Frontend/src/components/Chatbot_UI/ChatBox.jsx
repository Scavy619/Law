import { useEffect, useRef, useState, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import Message from "./Message";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axiosClient";
import DocumentUpload from "./DocumentUpload";

const getMessageKey = (message) =>
  `${message.role}|${message.content}|${message.createdAt}`;

const appendUniqueMessage = (existingMessages, message) => {
  const messageKey = getMessageKey(message);
  return existingMessages.some((item) => getMessageKey(item) === messageKey)
    ? existingMessages
    : [...existingMessages, message];
};

const ChatBox = () => {
  const containerRef = useRef(null);
  const lastSyncedSessionRef = useRef(null);
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
  const [activeDocument, setActiveDocument] = useState(null);

  // Track the last failed prompt so we can offer a retry
  const [failedPrompt, setFailedPrompt] = useState(null);

  const isInputDisabled =
    loadingResponse ||
    rateLimitCooldown ||
    creditsExhausted ||
    uploadingDocument;
  const hasCreditsCount = typeof creditsRemaining === "number";
  const hasUploadsCount = typeof uploadsRemaining === "number";

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
      attachedDocument: activeDocument || null,
    };
    setMessages((prev) => [...prev, userMessage]);
    setCurrentSession((prevSession) => {
      if (!prevSession || prevSession.sessionId !== activeSessionId) {
        return prevSession;
      }

      return {
        ...prevSession,
        messages: appendUniqueMessage(prevSession.messages || [], userMessage),
      };
    });

    try {
      const { data } = await api.post("/api/message/get-message", {
        message: text,
        sessionId: activeSessionId, // contextSessionId ki jagah
        attachedDocument: activeDocument || null,
      });

      if (data) {
        setActiveDocument(null);
        const botMessage = {
          role: "assistant",
          content: data.response.content,
          createdAt: new Date().toISOString(),
          sources: data.sources || [],
        };
        setMessages((prev) => [...prev, botMessage]);

        if (typeof data.creditsRemaining === "number") {
          setCreditsRemaining(data.creditsRemaining);
        }

        setCurrentSession((prevSession) => {
          if (!prevSession || prevSession.sessionId !== activeSessionId) {
            return prevSession;
          }

          return {
            ...prevSession,
            messages: appendUniqueMessage(
              appendUniqueMessage(prevSession.messages || [], userMessage),
              botMessage,
            ),
          };
        });
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
      setMessages((previousMessages) => {
        const incomingSessionId = currentSession.sessionId;
        const incomingMessages = currentSession.messages || [];
        const isSessionChanged =
          lastSyncedSessionRef.current !== incomingSessionId;

        if (isSessionChanged) {
          lastSyncedSessionRef.current = incomingSessionId;
          return incomingMessages;
        }

        if (incomingMessages.length < previousMessages.length) {
          return previousMessages;
        }

        return incomingMessages;
      });
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
                  <div className="text-center space-y-3">
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      Legal Assistant
                    </h1>
                    <p className="text-gray-600 text-base sm:text-lg leading-relaxed font-medium px-2">
                      Ask your legal question and get expert assistance
                    </p>
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start text-left gap-2 max-w-sm mx-auto">
                      <svg
                        className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      <p className="text-xs text-blue-800">
                        <strong>Privacy Note:</strong> Chats are not end-to-end
                        encrypted, but they are securely stored and never leaked
                        or shared with unauthorized parties.
                      </p>
                    </div>
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
              <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-3 mb-4 w-full">
                {/* Same avatar as assistant messages */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0 sm:self-end">
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                {/* Thinking bubble — same style as assistant message bubble */}
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md shadow-sm px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" />
                    <div
                      className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                      style={{ animationDelay: "0.15s" }}
                    />
                    <div
                      className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                      style={{ animationDelay: "0.3s" }}
                    />
                  </div>
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
      <div className="flex-shrink-0 sticky bottom-0 z-10 bg-white border-t border-gray-100 p-2 sm:p-4">
        <div className="max-w-4xl mx-auto">
          {/* Counters */}
          {!creditsExhausted && (
            <div className="flex justify-end gap-2 mb-1.5 flex-wrap">
              {hasUploadsCount && (
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    uploadsRemaining === 0
                      ? "bg-red-50 text-red-500 border border-red-200"
                      : "bg-blue-50 text-blue-600 border border-blue-200"
                  }`}
                >
                  {uploadsRemaining} upload{uploadsRemaining !== 1 ? "s" : ""}{" "}
                  left
                </span>
              )}
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  hasCreditsCount && creditsRemaining <= 3
                    ? "bg-red-50 text-red-500 border border-red-200"
                    : hasCreditsCount && creditsRemaining <= 5
                      ? "bg-amber-50 text-amber-600 border border-amber-200"
                      : hasCreditsCount
                        ? "bg-purple-50 text-purple-500 border border-purple-200"
                        : "bg-gray-50 text-gray-500 border border-gray-200"
                }`}
              >
                {hasCreditsCount
                  ? `${creditsRemaining} msg${creditsRemaining !== 1 ? "s" : ""} left`
                  : "Loading credits..."}
              </span>
            </div>
          )}

          {creditsExhausted ? (
            <div className="bg-gray-100 border border-gray-200 rounded-2xl p-3 flex items-center gap-3 opacity-60 cursor-not-allowed">
              <span className="flex-1 text-sm text-gray-400">
                Daily limit reached. Come back tomorrow.
              </span>
            </div>
          ) : (
            <>
              {activeDocument && (
                <div className="flex items-center gap-2 mb-2 bg-purple-50 border border-purple-200 rounded-xl px-3 py-2 text-sm text-purple-700">
                  <span className="truncate flex-1">
                    📎 {activeDocument.filename}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveDocument(null)}
                    className="text-purple-400 hover:text-purple-600 text-lg leading-none flex-shrink-0"
                  >
                    ×
                  </button>
                </div>
              )}
              <form
                onSubmit={onSubmit}
                className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-2 sm:p-3 flex gap-2 items-end"
              >
                <div className="flex-shrink-0 [&_span]:hidden">
                  <DocumentUpload onDocumentUploaded={setActiveDocument} />
                </div>
                <textarea
                  onChange={(e) => setPrompt(e.target.value)}
                  value={prompt}
                  placeholder={
                    rateLimitCooldown
                      ? "Rate limited — please wait..."
                      : "Ask your legal question..."
                  }
                  className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent resize-none min-h-[36px] max-h-28 leading-6 disabled:cursor-not-allowed"
                  required
                  disabled={isInputDisabled}
                  rows={1}
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height =
                      Math.min(e.target.scrollHeight, 112) + "px";
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
                  className="flex-shrink-0 p-2 md:p-3 bg-[#A456F7] hover:bg-[#9146E6] disabled:bg-gray-300 rounded-xl transition-colors"
                >
                  <img
                    src={loadingResponse ? assets.stop_icon : assets.send_icon}
                    alt={loadingResponse ? "loading" : "send"}
                    className="w-4 h-4 md:w-5 md:h-5 mx-auto"
                  />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
