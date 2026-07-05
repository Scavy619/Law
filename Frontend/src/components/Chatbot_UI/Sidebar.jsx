import { useState, useContext, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import { MessageCircle } from "lucide-react";
import { assets } from "../../assets/assets";
import moment from "moment";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosClient";
import { Check, Edit3, Home, Trash2, X } from "lucide-react";
import DeleteChatModal from "./DeleteChatModal";

const getChatDisplayName = (chat) => {
  const title = chat?.title?.trim();
  if (title) return title;

  const chatDate = chat?.createdAt || chat?.updatedAt;
  const formattedDate = moment(chatDate).isValid()
    ? moment(chatDate).format("MMM D, h:mm A")
    : moment().format("MMM D, h:mm A");

  return `Chat — ${formattedDate}`;
};

const Sidebar = ({ isMenuOpen, setIsMenuOpen }) => {
  const {
    userData,
    sessionId,
    setSessionId,
    currentSession,
    setCurrentSession,
    createNewChat,
    fetchUserChats,
    creditsRemaining,
    creditsExhausted,
  } = useContext(AppContext);

  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [chatSessions, setChatSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingTitleId, setEditingTitleId] = useState(null);
  const [tempTitle, setTempTitle] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load user's chat sessions from backend
  const loadChatSessions = async () => {
    if (!userData) return;

    setLoading(true);
    try {
      const { data } = await api.get("/api/chat/sessions");

      if (data.success) {
        setChatSessions(data.sessions || []);
      } else {
        toast.error(data.message || "Failed to load chat sessions");
      }
    } catch (error) {
      // console.log("Error loading chat sessions:", error);
      toast.error("Failed to load chat sessions");
    } finally {
      setLoading(false);
    }
  };

  // Handle clicking on an old session - use fetchUserChats to load it
  const handleChatClick = async (chatSession) => {
    try {
      setSessionId(chatSession.sessionId);
      navigate(`/chatbot/${chatSession.sessionId}`);
      // Use fetchUserChats to load the specific session
      await fetchUserChats(chatSession.sessionId);
      setIsMenuOpen(false);
    } catch (error) {
      toast.error("Error loading chat session");
      // console.log(error);
    }
  };

  // Delete any chat session
  const handleDeleteClick = (e, chat) => {
    e.stopPropagation();
    setChatToDelete(chat);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!chatToDelete) return;

    setIsDeleting(true);
    try {
      const { data } = await api.delete("/api/chat/delete", {
        data: { sessionId: chatToDelete.sessionId },
      });

      if (data.success) {
        // Reload sessions from backend after successful deletion
        await loadChatSessions();

        // If deleting current active session, redirect
        if (sessionId === chatToDelete.sessionId) {
          setSessionId(null);
          setCurrentSession(null);
          navigate("/chatbot");
        }
        toast.success(data.message || "Chat deleted successfully");
        setDeleteModalOpen(false);
        setChatToDelete(null);
      } else {
        toast.error(data.message || "Failed to delete chat");
      }
    } catch (error) {
      toast.error("Error deleting chat");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleNewChat = async () => {
    const newSessionId = await createNewChat();
    if (newSessionId) {
      navigate(`/chatbot/${newSessionId}`);
      // Reload sessions from backend to show the new chat
      await loadChatSessions();
    }
    setIsMenuOpen(false);
  };

  // Update chat title
  const updateChatTitle = async (sessionIdToUpdate, newTitle) => {
    try {
      // Update chat title in backend
      const { data } = await api.put("/api/chat/update-title", {
        sessionId: sessionIdToUpdate,
        title: newTitle,
      });

      if (data.success) {
        // Update local state
        setChatSessions((prevSessions) =>
          prevSessions.map((chat) =>
            chat.sessionId === sessionIdToUpdate
              ? {
                  ...chat,
                  title: newTitle,
                  updatedAt: new Date().toISOString(),
                }
              : chat,
          ),
        );
        toast.success("Chat title updated successfully");
      } else {
        toast.error(data.message || "Failed to update chat title");
      }
    } catch (error) {
      // console.log("Error updating chat title:", error);
      toast.error("Error updating chat title");
    }
  };

  const startEditingTitle = (chat) => {
    setEditingTitleId(chat.sessionId);
    setTempTitle(getChatDisplayName(chat));
  };

  const saveTitle = async (sessionIdToUpdate) => {
    if (tempTitle.trim()) {
      await updateChatTitle(sessionIdToUpdate, tempTitle.trim());
    }
    setEditingTitleId(null);
    setTempTitle("");
  };

  const cancelEdit = () => {
    setEditingTitleId(null);
    setTempTitle("");
  };

  // Load sessions on component mount
  useEffect(() => {
    loadChatSessions();
  }, [userData]);

  return (
    <div className="flex flex-col h-screen w-72 p-4 bg-gray-50 border-r border-gray-200">
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold text-black">
          Shivam Parashar Advocate
        </span>
        <button
          type="button"
          onClick={() => setIsMenuOpen(false)}
          className="p-2 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors"
          aria-label="Close sidebar"
          title="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      {/* Go to Homepage Button */}
      <button
        onClick={() => {
          navigate("/");
          setIsMenuOpen(false);
        }}
        className="flex justify-center items-center w-full py-3 mt-15 text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-sm rounded-md cursor-pointer transition-colors"
      >
        <Home size={16} className="mr-2" /> Go to Homepage
      </button>

      {/* New Chat Button */}
      <button
        onClick={handleNewChat}
        disabled={!userData}
        className="flex justify-center items-center w-full py-2 mt-3 text-white bg-[#A456F7] hover:bg-[#9146E6] text-sm rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <span className="mr-2 text-xl">+</span> New Legal Chat
      </button>

      {/* Search Conversations */}
      <div className="flex items-center gap-3 p-3 mt-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-all duration-200">
        <img
          src={assets.search_icon}
          alt="search"
          className="w-4 h-4 opacity-70 not-dark:invert flex-shrink-0"
        />
        <input
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          type="text"
          placeholder="Search conversations..."
          className="flex-1 text-sm placeholder:text-gray-400 text-gray-700 outline-none bg-transparent"
        />
      </div>

      {/* Recent Chats */}
      {chatSessions.length > 0 && (
        <div className="mt-6 mb-2">
          <h3 className="text-base font-semibold text-center text-gray-900">
            Recent Legal Chats
          </h3>
        </div>
      )}
      <div className="flex-1 overflow-y-scroll mt-3 text-sm space-y-3">
        {loading ? (
          <div className="text-center text-gray-500">Loading chats...</div>
        ) : (
          chatSessions
            .filter((chat) => {
              const searchTerm = search.toLowerCase();
              return (
                (chat.title && chat.title.toLowerCase().includes(searchTerm)) ||
                (chat.lastMessage &&
                  chat.lastMessage.toLowerCase().includes(searchTerm)) ||
                chat.sessionId.toLowerCase().includes(searchTerm)
              );
            })
            .map((chat) => (
              <div
                key={chat.sessionId}
                className={`p-2 px-4 border border-gray-300 rounded-md flex justify-between group ${
                  sessionId === chat.sessionId
                    ? "bg-[#A456F7] text-white"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                <div
                  className="flex-1 min-w-0"
                  onClick={() => !editingTitleId && handleChatClick(chat)}
                >
                  {editingTitleId === chat.sessionId ? (
                    <input
                      type="text"
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveTitle(chat.sessionId);
                        if (e.key === "Escape") cancelEdit();
                      }}
                      onBlur={() => saveTitle(chat.sessionId)}
                      className="w-full text-sm bg-transparent border-b border-primary outline-none"
                      autoFocus
                    />
                  ) : (
                    <p
                      className="truncate cursor-pointer"
                      onDoubleClick={() => startEditingTitle(chat)}
                    >
                      {getChatDisplayName(chat)}
                    </p>
                  )}
                  <p
                    className={`text-sm font-medium mt-1 ${
                      sessionId === chat.sessionId
                        ? "text-white/90"
                        : "text-[#A456F7]"
                    }`}
                  >
                    {moment(chat.updatedAt).format("MMM DD, YYYY h:mm A")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (editingTitleId === chat.sessionId) {
                        saveTitle(chat.sessionId);
                        return;
                      }
                      startEditingTitle(chat);
                    }}
                    className={`p-1 rounded transition-all duration-200 ${
                      editingTitleId === chat.sessionId
                        ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        : "text-black hover:text-gray-700 hover:bg-white/20"
                    }`}
                  >
                    {editingTitleId === chat.sessionId ? (
                      <Check size={16} />
                    ) : (
                      <Edit3 size={16} />
                    )}
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(e, chat)}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all duration-200"
                    aria-label="Delete chat"
                    title="Delete chat"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
        )}
      </div>

      {/* Credits + User Info — pinned at bottom */}
      {userData && (
        <div className="mt-auto flex flex-col gap-2 pt-3">
          {/* Daily Credits Info */}
          <div
            className={`p-3 rounded-xl border text-xs ${
              creditsExhausted
                ? "bg-red-50 border-red-200"
                : creditsRemaining !== null && creditsRemaining <= 3
                  ? "bg-amber-50 border-amber-200"
                  : "bg-purple-50 border-purple-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <MessageCircle
                size={13}
                className={
                  creditsExhausted
                    ? "text-red-500"
                    : creditsRemaining !== null && creditsRemaining <= 3
                      ? "text-amber-500"
                      : "text-purple-600"
                }
              />
              <span
                className={`font-semibold ${
                  creditsExhausted
                    ? "text-red-700"
                    : creditsRemaining !== null && creditsRemaining <= 3
                      ? "text-amber-700"
                      : "text-purple-700"
                }`}
              >
                {creditsExhausted
                  ? "No messages left today"
                  : creditsRemaining !== null
                    ? `${creditsRemaining} of 10 messages left`
                    : "Loading credits..."}
              </span>
            </div>
            <p
              className={`leading-relaxed ${
                creditsExhausted
                  ? "text-red-600"
                  : creditsRemaining !== null && creditsRemaining <= 3
                    ? "text-amber-600"
                    : "text-purple-600"
              }`}
            >
              {creditsExhausted
                ? "Daily limit reached. Resets at midnight."
                : "10 free messages daily. Resets at midnight."}
            </p>
          </div>

          {/* User Info */}
          <div
            className="p-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => {
              navigate("/my-profile");
              setIsMenuOpen(false);
            }}
          >
            <div className="flex items-center gap-3">
              <img
                src={assets.user_icon}
                alt="user"
                className="w-7 rounded-full"
              />
              <p className="text-sm text-gray-800 truncate">
                {userData.name}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteChatModal
        isOpen={deleteModalOpen}
        onClose={() => {
          if (!isDeleting) {
            setDeleteModalOpen(false);
            setChatToDelete(null);
          }
        }}
        onConfirm={confirmDelete}
        chatTitle={chatToDelete ? getChatDisplayName(chatToDelete) : ""}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default Sidebar;
