import { toast } from "react-toastify";
import { getLawyersData as fetchLawyersAPI } from "../api/lawyer.api";
import { getUserProfileData } from "../api/user.api";
import { createChat, getChatBySession } from "../api/chat.api";

export const appActions = ({
  backendUrl,
  token,
  setLawyers,
  setUserData,
  setSessionId,
  setCurrentSession,
}) => ({
  // ================= LAWYERS =================
  getLawyersData: async () => {
    try {
      const { data } = await fetchLawyersAPI(backendUrl);
      if (data.success) setLawyers(data.lawyers);
      else toast.error(data.message);
    } catch (err) {
      console.error(err);
    }
  },

  // ================= USER =================
  loadUserProfileData: async () => {
    if (!token) return;
    try {
      const { data } = await getUserProfileData(backendUrl, token);
      if (data.success) setUserData(data.user);
      else toast.error(data.message);
    } catch (err) {
      console.error(err);
    }
  },

  // ================= CHAT =================
  createNewChat: async () => {
    if (!token) {
      toast.error("Please login to create a chat");
      return null;
    }

    const session = `session-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`;

    setSessionId(session);

    try {
      const { data } = await createChat(backendUrl, token, session);

      if (!data.success) {
        toast.error(data.message);
        return null;
      }

      setCurrentSession({
        sessionId: session,
        messages: [],
        _id: data.chatId,
      });

      return session;
    } catch (err) {
      toast.error("Error creating chat");
      console.error(err);
      return null;
    }
  },

  fetchUserChats: async (targetSessionId) => {
    if (!token || !targetSessionId) return;

    try {
      const { data } = await getChatBySession(
        backendUrl,
        token,
        targetSessionId
      );

      if (data.success) {
        setCurrentSession(data.chats);
        return data.chats;
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  },
});
