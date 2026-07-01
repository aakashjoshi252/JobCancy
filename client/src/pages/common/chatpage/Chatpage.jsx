import { useState, useEffect } from "react";
import { useSocket } from "../../../context/SocketContext";
import ChatList from "../../../components/chatbox/ChatList";
import ChatBox from "../../../components/chatbox/Chatbox";
import AvailableCandidates from "../../../components/chatbox/AvailableCandidates";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

const ChatPage = () => {
  const { t } = useTranslation(["chat", "common"]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChatList, setShowChatList] = useState(true);
  const [showCandidatesList, setShowCandidatesList] = useState(false);
  const { isConnected, onlineUsers } = useSocket();
  const user = useSelector((state) => state.auth.user);
  const peerLabel = user?.role === "candidate" ? t("roles.recruiter", { ns: "common" }) : t("roles.candidate", { ns: "common" });

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobileView(mobile);
      if (!mobile) {
        setShowChatList(true);
      }
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setShowCandidatesList(false);
    if (isMobileView) {
      setShowChatList(false);
    }
  };

  const handleStartNewChat = () => {
    setShowCandidatesList(true);
    setSelectedChat(null);
    if (isMobileView) {
      setShowChatList(false);
    }
  };

  const handleBack = () => {
    if (showCandidatesList) {
      setShowCandidatesList(false);
      setShowChatList(true);
    } else if (selectedChat && isMobileView) {
      setSelectedChat(null);
      setShowChatList(true);
    }
  };

  const handleBackToChats = () => {
    setShowCandidatesList(false);
    setSelectedChat(null);
    setShowChatList(true);
  };

  return (
    <div className="chat-route-shell h-full min-h-[calc(100dvh-4rem)] overflow-hidden bg-gray-100">
      <div className="mx-auto h-full max-w-[1600px] px-0 py-0 sm:px-4 sm:py-4 lg:py-6">
        <div className="flex h-full min-h-0 overflow-hidden rounded-none bg-white shadow-2xl sm:rounded-2xl">
          {/* Chat List Sidebar */}
          {!showCandidatesList && (
            <div className={`
              ${isMobileView ? (showChatList ? "w-full" : "hidden") : "w-96"}
              min-w-0 flex-shrink-0 border-r border-gray-200
            `}>
              <ChatList 
                onSelectChat={handleSelectChat} 
                selectedChatId={selectedChat?._id}
                onStartNewChat={handleStartNewChat}
              />
            </div>
          )}
          
          {/* Available Candidates List */}
          {showCandidatesList && (
            <div className={`
              ${isMobileView ? "w-full" : "w-96"}
              min-w-0 flex-shrink-0 border-r border-gray-200
            `}>
              <AvailableCandidates 
                onSelectCandidate={handleSelectChat}
                onBack={handleBackToChats}
              />
            </div>
          )}
          
          {/* Chat Box */}
          <div className={`
            min-w-0 flex-1 flex-col
            ${isMobileView && (showChatList || showCandidatesList) ? "hidden" : "flex"}
            ${isMobileView && !showChatList && !showCandidatesList ? "w-full" : ""}
          `}>
            {selectedChat ? (
              <ChatBox chat={selectedChat} onBack={handleBack} />
            ) : (
              <div className="flex min-h-0 flex-1 items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50/30 p-4">
                <div className="max-w-sm space-y-4 text-center">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100 shadow-lg sm:h-32 sm:w-32">
                    <svg className="h-12 w-12 text-blue-500 sm:h-16 sm:w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">{t("chatWithRole", { role: peerLabel })}</h2>
                    <p className="text-gray-500 mt-2">
                      {showCandidatesList 
                        ? t("selectPeerToStart", { role: peerLabel.toLowerCase() }) 
                        : t("selectConversation")}
                    </p>
                    {!showCandidatesList && (
                      <button
                        onClick={handleStartNewChat}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>{t("startNewChat")}</span>
                      </button>
                    )}
                    {!isConnected && (
                      <p className="text-sm text-yellow-600 mt-4">
                         {t("connecting")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
