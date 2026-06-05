
import { useEffect, useState, useCallback } from "react";
import { chatApi } from "../../api/api";
import { useSelector } from "react-redux";
import { formatDistanceToNow, format } from "date-fns";
import { useSocket, useSocketEvent } from "../../context/SocketContext";
import {
  HiSearch,
  HiChatAlt2,
  HiChevronRight,
  HiBadgeCheck,
  HiBell,
  HiUserGroup,
  HiClock,
  HiUserAdd
} from "react-icons/hi";
import { FaBellSlash } from "react-icons/fa";
import UserAvatar from "../ui/UserAvatar";
import { useTranslation } from "react-i18next";

const ChatList = ({ onSelectChat, selectedChatId, onStartNewChat }) => {
  const { t } = useTranslation(["chat", "common"]);
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [mutedChats, setMutedChats] = useState(new Set());
  const user = useSelector((state) => state.auth.user);
  const { onlineUsers, showNotification } = useSocket();
  const peerRole =
    user?.role === "candidate"
      ? t("roles.recruiter", { ns: "common" }).toLowerCase()
      : t("roles.candidate", { ns: "common" }).toLowerCase();

  // Fetch all chats owned by the current user.
  const fetchChats = useCallback(async () => {
    if (!user?._id) return;
    
    try {
      setLoading(true);
      const response = await chatApi.get(`/user/${user._id}`);
      
      const chatsWithDetails = response.data.chats
        .map(chat => {
          const otherUser = chat.participants?.find(p => p._id !== user._id);
          const isOnline = onlineUsers.includes(otherUser?._id);
          
          return {
            ...chat,
            otherUser,
            isOnline,
            unreadCount: chat.unreadCount || 0
          };
        });
      
      // Sort by updatedAt
      const sortedChats = chatsWithDetails.sort((a, b) => 
        new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      
      setChats(sortedChats);
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  }, [user?._id, onlineUsers]);

  // Listen for new messages
  useSocketEvent("receiveMessage", (message) => {
    setChats(prevChats => {
      const chatIndex = prevChats.findIndex(c => c._id === message.chatId);
      if (chatIndex === -1) return prevChats;
      const messagePreview = message.text || message.attachment?.originalName || t("attachFile");
      
      const updatedChats = [...prevChats];
      const chat = updatedChats[chatIndex];
      
      // Update last message
      updatedChats[chatIndex] = {
        ...chat,
        lastMessage: messagePreview,
        updatedAt: message.createdAt,
        unreadCount: message.senderId !== user?._id && chat._id !== selectedChatId 
          ? (chat.unreadCount || 0) + 1 
          : chat.unreadCount
      };
      
      // Move to top
      const [movedChat] = updatedChats.splice(chatIndex, 1);
      const newChats = [movedChat, ...updatedChats];
      
      // Show notification if not in this chat.
      if (selectedChatId !== message.chatId && message.senderId !== user?._id) {
        const chat = prevChats[chatIndex];
        const otherUser = chat?.otherUser;
        
        if (otherUser && !mutedChats.has(chat._id)) {
          showNotification(
            t("messageReceived", { defaultValue: "New message from {{sender}}", sender: otherUser?.username }),
            messagePreview.length > 50 ? `${messagePreview.substring(0, 50)}...` : messagePreview,
            null,
            () => onSelectChat(chat)
          );
        }
      }
      
      return newChats;
    });
  });

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const handleSelectChat = (chat) => {
    // Mark messages as read.
    if (chat.unreadCount > 0) {
      chatApi.patch(`/${chat._id}/read`).catch(() => {});
      setChats(prev => prev.map(c => 
        c._id === chat._id ? { ...c, unreadCount: 0 } : c
      ));
    }
    onSelectChat(chat);
  };

  const toggleMuteChat = (e, chatId) => {
    e.stopPropagation();
    setMutedChats(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chatId)) {
        newSet.delete(chatId);
      } else {
        newSet.add(chatId);
      }
      return newSet;
    });
  };

  const getTimeDisplay = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return format(date, "HH:mm");
    if (diffDays === 1) return t("yesterday");
    if (diffDays < 7) return format(date, "EEE");
    return format(date, "MM/dd");
  };

  const filteredChats = chats.filter(chat =>
    chat.otherUser?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex-shrink-0 px-5 py-6 bg-gradient-to-r from-[#1A3D63] to-[#1e4d7a]">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
              <HiChatAlt2 className="text-white text-2xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">{t("title")}</h2>
              <p className="text-blue-100 text-sm mt-0.5">
                {t("conversationCount", { count: chats.length, role: peerRole })}
              </p>
            </div>
          </div>
          
          {/* New Chat Button */}
          <button
            onClick={onStartNewChat}
            className="p-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all duration-200 group"
            title={t("selectPeerToStart", { role: peerRole })}
          >
            <HiUserAdd className="text-white text-xl group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            placeholder={t("searchPeers", { role: peerRole })}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border-0 bg-white/95 focus:bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-gray-900 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-gray-600 font-medium">{t("loadingConversations")}</p>
            </div>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
              <HiChatAlt2 className="text-gray-400 text-5xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {searchQuery ? t("noPeerFound", { role: peerRole }) : t("noConversationsYet")}
            </h3>
            <p className="text-gray-500 text-sm max-w-xs">
              {searchQuery 
                ? t("tryDifferentSearch") 
                : t("selectPeerToStart", { role: peerRole })}
            </p>
            {!searchQuery && (
              <button
                onClick={onStartNewChat}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <HiUserAdd className="text-lg" />
                <span>{t("startNewChat")}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredChats.map((chat) => {
              const { otherUser, lastMessage, updatedAt, isOnline, _id, unreadCount } = chat;
              const isMuted = mutedChats.has(_id);
              const isSelected = selectedChatId === _id;
              
              return (
                <div
                  key={_id}
                  onClick={() => handleSelectChat(chat)}
                  className={`
                    relative flex items-center gap-4 px-5 py-4 cursor-pointer transition-all duration-200
                    ${isSelected 
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600" 
                      : "bg-white hover:bg-gray-50"
                    }
                  `}
                >
                  {/* Avatar with online indicator */}
                  <div className="relative flex-shrink-0">
                    <UserAvatar
                      user={otherUser}
                      className={`h-14 w-14 text-lg shadow-md transition-all ${
                        isSelected ? "ring-2 ring-blue-400 ring-offset-2" : ""
                      }`}
                    />
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full animate-pulse" />
                    )}
                  </div>

                  {/* Chat info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <p className={`font-semibold truncate ${isSelected ? "text-blue-700" : "text-gray-900"}`}>
                          {otherUser?.username || t("unknownUser")}
                        </p>
                        {otherUser?.verified && (
                          <HiBadgeCheck className="text-blue-600 text-base flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                        <span className="text-xs text-gray-400">
                          {getTimeDisplay(updatedAt)}
                        </span>
                        <button
                          onClick={(e) => toggleMuteChat(e, _id)}
                          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          {isMuted ? (
                            <FaBellSlash  className="text-gray-400 text-sm" />
                          ) : (
                            <HiBell className="text-gray-400 text-sm" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-500 truncate flex-1">
                        {lastMessage || t("noMessagesYet")}
                      </p>
                      {unreadCount > 0 && !isMuted && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold flex-shrink-0 animate-pulse">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </div>
                    
                    {/* Candidate badge */}
                    <div className="mt-1.5">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
                        {user?.role === "candidate"
                          ? t("roles.recruiter", { ns: "common" })
                          : t("roles.candidate", { ns: "common" })}
                      </span>
                    </div>
                  </div>

                  {/* Arrow indicator */}
                  <HiChevronRight className={`
                    flex-shrink-0 text-xl transition-all
                    ${isSelected ? "text-blue-600 translate-x-1" : "text-gray-300 group-hover:text-blue-400 group-hover:translate-x-1"}
                  `} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
