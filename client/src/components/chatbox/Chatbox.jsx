// components/ChatBox.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import { useSocket, useUserOnlineStatus } from "../../context/SocketContext";
import { useSelector } from "react-redux";
import { chatApi } from "../../api/api";
import toast from "react-hot-toast";
import { formatDistanceToNow, format } from "date-fns";
import {
  HiArrowLeft,
  HiDotsVertical,
  HiPaperAirplane,
  HiEmojiHappy,
  HiPaperClip,
  HiX,
  HiDocumentDownload,
  HiUserCircle,
  HiOutlineTrash,
  HiOutlineSearch,
  HiOutlineCheckCircle
} from "react-icons/hi";
import { BsCheck2All, BsCheck2 } from "react-icons/bs";
import UserAvatar from "../ui/UserAvatar";
import { useTranslation } from "react-i18next";
import { translateApiError } from "../../utils/apiErrors";

const isRemoteUrl = (url = "") => /^https?:\/\//i.test(url);

const ChatBox = ({ chat, onBack }) => {
  const { t } = useTranslation(["chat", "errors", "common"]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [attachmentUrls, setAttachmentUrls] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const uploadControllerRef = useRef(null);
  const attachmentUrlsRef = useRef({});

  const { isConnected, emit, on, off } = useSocket();
  const user = useSelector((state) => state.auth.user);

  const chatId = chat._id;
  const otherUser = chat.participants?.find(p => p._id !== user._id);
  const isOtherUserOnline = useUserOnlineStatus(otherUser?._id);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await chatApi.get(`/${chatId}/messages`);
      setMessages(res.data.messages || []);
      await chatApi.patch(`/${chatId}/read`);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    let active = true;
    const attachmentMessages = messages.filter((message) => message.attachment?.url);
    const missingAttachments = attachmentMessages.filter(
      (message) => !attachmentUrls[message._id] && !isRemoteUrl(message.attachment.url)
    );

    Promise.all(
      missingAttachments.map(async (message) => {
        const response = await chatApi.get(`/download/${message._id}`, { responseType: "blob" });
        const url = URL.createObjectURL(response.data);
        return [message._id, url];
      })
    )
      .then((entries) => {
        if (!active) {
          entries.forEach(([, url]) => URL.revokeObjectURL(url));
          return;
        }
        if (entries.length === 0) return;
        entries.forEach(([messageId, url]) => {
          attachmentUrlsRef.current[messageId] = url;
        });
        setAttachmentUrls((current) => ({ ...current, ...Object.fromEntries(entries) }));
      })
      .catch(() => {
        // Attachment cards still render if one preview cannot be loaded.
      });

    return () => {
      active = false;
    };
  }, [attachmentUrls, messages]);

  useEffect(() => () => {
    Object.values(attachmentUrlsRef.current).forEach((url) => URL.revokeObjectURL(url));
    attachmentUrlsRef.current = {};
  }, []);

  const clearSelectedFile = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl("");
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [previewUrl]);

  useEffect(() => {
    const cancelChatUpload = () => {
      uploadControllerRef.current?.abort();
      clearSelectedFile();
    };

    window.addEventListener("chat:logout", cancelChatUpload);
    return () => {
      window.removeEventListener("chat:logout", cancelChatUpload);
      uploadControllerRef.current?.abort();
    };
  }, [clearSelectedFile]);

  useEffect(() => {
    fetchMessages();

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [fetchMessages]);

  useEffect(() => {
    if (!isConnected) return undefined;

    emit("joinChat", chatId);

    return () => {
      emit("leaveChat", chatId);
    };
  }, [chatId, emit, isConnected]);

  // Socket event listeners
  useEffect(() => {
    const handleReceiveMessage = (message) => {
      if (message.chatId === chatId) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      }
    };
    
    const handleUserTyping = ({ chatId: typingChatId }) => {
      if (typingChatId === chatId) setIsTyping(true);
    };
    
    const handleUserStoppedTyping = ({ chatId: typingChatId }) => {
      if (typingChatId === chatId) setIsTyping(false);
    };
    
    on("receiveMessage", handleReceiveMessage);
    on("userTyping", handleUserTyping);
    on("userStoppedTyping", handleUserStoppedTyping);
    
    return () => {
      off("receiveMessage", handleReceiveMessage);
      off("userTyping", handleUserTyping);
      off("userStoppedTyping", handleUserStoppedTyping);
    };
  }, [chatId, on, off]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleTyping = (e) => {
    setText(e.target.value);

    if (!isConnected) return;

    emit("typing", { chatId, userName: user.username });
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emit("stopTyping", { chatId });
    }, 2000);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (isSending || isUploading || !isConnected) return;

    if (selectedFile) {
      await sendAttachment();
      return;
    }

    if (!text.trim()) return;

    setIsSending(true);
    
    emit("sendMessage", {
      chatId,
      text: text.trim()
    });
    
    setText("");
    emit("stopTyping", { chatId });
    
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    
    setTimeout(() => setIsSending(false), 500);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedExtensions = /\.(jpe?g|png|webp|pdf|docx?|xlsx?|txt|zip)$/i;
    if (!allowedExtensions.test(file.name)) {
      toast.error(t("attachmentTypeError"));
      event.target.value = "";
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error(t("attachmentSizeError"));
      event.target.value = "";
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(file.type.startsWith("image/") ? URL.createObjectURL(file) : "");
  };

  const sendAttachment = async () => {
    if (!selectedFile || !isConnected) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    if (text.trim()) formData.append("text", text.trim());

    uploadControllerRef.current = new AbortController();
    setIsUploading(true);
    setUploadProgress(0);

    try {
      await chatApi.post(`/${chatId}/attachment`, formData, {
        signal: uploadControllerRef.current.signal,
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          if (!event.total) return;
          setUploadProgress(Math.round((event.loaded / event.total) * 100));
        },
      });
      setText("");
      clearSelectedFile();
    } catch (error) {
      if (error.code !== "ERR_CANCELED") {
        toast.error(translateApiError(error, t, "unableToUploadAttachment"));
      }
    } finally {
      uploadControllerRef.current = null;
      setIsUploading(false);
    }
  };

  const formatFileSize = (size = 0) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const openAttachmentDownload = async (message) => {
    try {
      let tempUrl = "";
      const url = attachmentUrls[message._id]
        || (tempUrl = URL.createObjectURL((await chatApi.get(`/download/${message._id}`, { responseType: "blob" })).data));
      const link = document.createElement("a");
      link.href = url;
      link.download = message.attachment.originalName || message.attachment.fileName || "attachment";
      link.click();
      if (tempUrl) window.setTimeout(() => URL.revokeObjectURL(tempUrl), 1000);
    } catch (error) {
      toast.error(translateApiError(error, t, "unableToDownloadAttachment"));
    }
  };

  const getMessageStatus = (message) => {
    if (message.isRead) return <BsCheck2All className="text-blue-500 text-sm" title={t("read")} />;
    return <BsCheck2 className="text-gray-400 text-sm" title={t("sent")} />;
  };

  const groupMessagesByDate = () => {
    const groups = {};
    messages.forEach(msg => {
      const date = format(new Date(msg.createdAt), "yyyy-MM-dd");
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate();

  const getDateLabel = (dateStr) => {
    const today = format(new Date(), "yyyy-MM-dd");
    const yesterday = format(new Date(Date.now() - 86400000), "yyyy-MM-dd");
    
    if (dateStr === today) return t("today");
    if (dateStr === yesterday) return t("yesterday");
    return format(new Date(dateStr), "MMMM d, yyyy");
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Header */}
      <div className="sticky top-0 z-20 flex-shrink-0 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 shadow-xl">
        <div className="flex items-center gap-3 px-3 py-3 sm:px-6">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-white transition-all duration-200 hover:bg-white/20 lg:hidden"
            aria-label={t("backToChats", { defaultValue: "Back to chats" })}
          >
            <HiArrowLeft className="text-white text-xl" />
          </button>

          <div className="group relative shrink-0 cursor-pointer">
            <UserAvatar
              user={otherUser}
              className="h-10 w-10 border border-white/20 text-base shadow-lg transition-transform duration-200 group-hover:scale-105 sm:h-12 sm:w-12 sm:text-lg"
            />
            {isOtherUserOnline && (
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full animate-pulse" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="truncate text-base font-semibold text-white sm:text-lg">
              {otherUser?.username}
            </p>
            <p className="text-xs text-blue-200">
              {isTyping ? (
                <span className="flex items-center gap-1">
                  <span className="animate-pulse">{t("typing")}</span>
                  <span className="flex gap-0.5">
                    <span className="w-1 h-1 bg-blue-200 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1 h-1 bg-blue-200 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1 h-1 bg-blue-200 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                </span>
              ) : isOtherUserOnline ? (
                t("online")
              ) : (
                t("offline")
              )}
            </p>
          </div>

          {/* Options Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowOptions(!showOptions)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-white transition-all duration-200 hover:bg-white/20"
              aria-label={t("chatOptions", { defaultValue: "Chat options" })}
            >
              <HiDotsVertical className="text-white text-xl" />
            </button>

            {showOptions && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowOptions(false)} />
                <div
                  className="absolute top-full z-20 mt-2 w-[min(14rem,calc(100vw-1rem))] overflow-hidden rounded-xl border border-gray-100 bg-white shadow-2xl"
                  style={{ insetInlineEnd: 0 }}
                >
                  <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-all text-gray-700">
                    <HiUserCircle className="text-blue-500 text-lg" />
                    <span className="text-sm">{t("viewProfile")}</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-all text-gray-700">
                    <HiOutlineSearch className="text-purple-500 text-lg" />
                    <span className="text-sm">{t("searchInChat")}</span>
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-all text-red-600">
                    <HiOutlineTrash className="text-red-500 text-lg" />
                    <span className="text-sm">{t("deleteChat")}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="min-h-0 flex-1 space-y-6 overflow-y-auto px-3 py-4 sm:px-6"
        style={{
          scrollBehavior: "smooth",
          backgroundImage: "radial-gradient(circle at 10px 10px, rgba(0,0,0,0.02) 2px, transparent 2px)",
          backgroundSize: "30px 30px"
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-gray-600 font-medium">{t("loadingMessages")}</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center shadow-lg">
                <HiPaperAirplane className="text-blue-600 text-4xl" />
              </div>
              <div>
                <p className="text-gray-800 font-semibold text-lg">
                  {t("noMessagesYet")}
                </p>
                <p className="text-gray-500 text-sm mt-1 max-w-xs">
                  {t("startConversation")} {otherUser?.username ? ` ${otherUser.username}` : ""}
                </p>
              </div>
            </div>
          </div>
        ) : (
          Object.entries(messageGroups).map(([date, msgs]) => (
            <div key={date} className="space-y-3">
              <div className="flex justify-center">
                <span className="text-xs text-gray-500 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
                  {getDateLabel(date)}
                </span>
              </div>
              {msgs.map((msg, idx) => {
                const isOwn = msg.senderId?._id === user._id || msg.senderId === user._id;
                const senderName = isOwn ? t("you") : msg.senderId?.username || t("unknownUser");
                const attachmentUrl = attachmentUrls[msg._id] || (isRemoteUrl(msg.attachment?.url) ? msg.attachment.url : "");
                
                return (
                  <div
                    key={msg._id || idx}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div className="group max-w-[92%] sm:max-w-[75%] md:max-w-[65%] lg:max-w-[55%]">
                      {!isOwn && (
                        <p className="text-xs text-gray-500 mb-1 ml-1">{senderName}</p>
                      )}
                      <div
                        className={`px-4 py-3 rounded-2xl shadow-md transition-all duration-200 hover:shadow-lg ${
                          isOwn
                            ? "chat-bubble-own bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-none"
                            : "chat-bubble-peer bg-white text-gray-800 rounded-bl-none border border-gray-100"
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {msg.text}
                        </p>
                        {msg.attachment?.url && msg.messageType === "image" && (
                          <button
                            type="button"
                            onClick={() => attachmentUrl && setPreviewImage({ url: attachmentUrl, name: msg.attachment.originalName })}
                            className="mt-3 block max-w-full overflow-hidden rounded-xl border border-white/20 bg-white/10"
                          >
                            {attachmentUrl ? (
                              <img
                                src={attachmentUrl}
                                alt={msg.attachment.originalName || t("attachFile")}
                                className="max-h-72 w-full object-cover"
                              />
                            ) : (
                              <span className="block px-4 py-8 text-sm font-medium">{t("loadingImage")}</span>
                            )}
                          </button>
                        )}
                        {msg.attachment?.url && msg.messageType !== "image" && (
                          <button
                            type="button"
                            onClick={() => openAttachmentDownload(msg)}
                            className={`mt-3 flex max-w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                              isOwn
                                ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
                                : "border-gray-200 bg-gray-50 text-gray-800 hover:bg-gray-100"
                            }`}
                          >
                            <HiDocumentDownload className="shrink-0 text-2xl" />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-semibold">{msg.attachment.originalName}</span>
                              <span className={`block text-xs ${isOwn ? "text-blue-100" : "text-gray-500"}`}>
                                {msg.attachment.fileType?.toUpperCase()} - {formatFileSize(msg.attachment.fileSize)}
                              </span>
                            </span>
                          </button>
                        )}
                      </div>
                      
                      <div className={`flex items-center gap-1.5 mt-1 px-1 ${isOwn ? "justify-end" : "justify-start"}`}>
                        <span className="text-[10px] text-gray-400">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {isOwn && getMessageStatus(msg)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {isTyping && (
        <div className="flex-shrink-0 px-4 sm:px-6 py-2">
          <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-gray-100 bg-white/80 px-4 py-2 shadow-sm backdrop-blur-sm">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-xs text-gray-600 font-medium">
              {t("isTyping", { name: otherUser?.username || t("unknownUser") })}
            </span>
          </div>
        </div>
      )}

      {/* Connection Status */}
      {!isConnected && (
        <div className="flex-shrink-0 px-4 py-2 bg-yellow-50 border-t border-yellow-200">
          <p className="text-xs text-yellow-700 text-center">
            {t("connecting")}
          </p>
        </div>
      )}

      {/* Input Area */}
      <form
        onSubmit={sendMessage}
        className="flex-shrink-0 border-t border-gray-200 bg-white px-3 py-3 shadow-lg sm:px-6 sm:py-4"
      >
        <div className="flex min-w-0 items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={!isConnected || isUploading}
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 text-gray-600 transition hover:bg-white hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            title={t("attachFile")}
          >
            <HiPaperClip className="text-xl" />
          </button>
          {/* Text Input */}
          <div className="relative min-w-0 flex-1">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleTyping}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(e);
                }
              }}
              placeholder={t("typeMessage")}
              rows={1}
              disabled={!isConnected}
              className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 transition-all hover:bg-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
              style={{
                minHeight: "48px",
                maxHeight: "120px",
              }}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={(!text.trim() && !selectedFile) || isSending || isUploading || !isConnected}
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-3.5 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={t("sendMessage", { defaultValue: "Send message" })}
          >
            <HiPaperAirplane className={`text-xl ${isSending ? "animate-pulse" : ""}`} />
          </button>
        </div>
        {selectedFile && (
          <div className="mt-3 rounded-2xl border border-blue-100 bg-blue-50 p-3">
            <div className="flex items-start gap-3">
              {previewUrl ? (
                <img src={previewUrl} alt={selectedFile.name} className="h-16 w-16 rounded-xl object-cover" />
              ) : (
                <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-white text-2xl text-blue-600">
                  <HiPaperClip />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">{selectedFile.name}</p>
                <p className="text-xs text-gray-600">{formatFileSize(selectedFile.size)}</p>
                {isUploading && (
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-blue-100">
                    <div className="h-full bg-blue-600 transition-all" style={{ width: `${uploadProgress}%` }} />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  uploadControllerRef.current?.abort();
                  clearSelectedFile();
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-white hover:text-gray-900"
                aria-label={t("removeAttachment")}
              >
                <HiX className="text-lg" />
              </button>
            </div>
          </div>
        )}
      </form>
      {previewImage && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-gray-950/80 p-4" onClick={() => setPreviewImage(null)}>
          <div className="max-h-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between gap-3 text-white">
              <p className="truncate text-sm font-semibold">{previewImage.name}</p>
              <button type="button" onClick={() => setPreviewImage(null)} className="rounded-lg bg-white/10 p-2 hover:bg-white/20">
                <HiX className="text-xl" />
              </button>
            </div>
            <img src={previewImage.url} alt={previewImage.name} className="max-h-[85dvh] max-w-full rounded-2xl bg-white object-contain shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
