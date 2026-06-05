const path = require("path");
const fs = require("fs");
const { Readable } = require("stream");
const Message = require("../models/message.model.js");
const Chat = require("../models/chatbox.model.js");
const { notifyNewMessage } = require("../utils/notificationHelper.js");
const { uploadChatAttachmentToCloudinary, deleteFromCloudinary } = require("../config/cloudinary");

const isParticipant = (chat, userId) =>
  chat?.participants?.some((participant) => participant.toString() === userId.toString());

const getChatForUser = async (chatId, userId) => {
  if (!chatId || !userId) return null;

  const chat = await Chat.findById(chatId);
  return isParticipant(chat, userId) ? chat : null;
};

const getReceiverId = (chat, senderId) =>
  chat.participants.find((participant) => participant.toString() !== senderId.toString()) || null;

const getMessagePreview = (message) => {
  if (message.text?.trim()) return message.text.trim().substring(0, 100);
  if (message.messageType === "image") return "Image";
  return "Attachment";
};

const deleteUploadedChatAttachment = async (attachment) => {
  if (!attachment?.publicId) return;

  try {
    await deleteFromCloudinary(attachment.publicId, {
      resourceType: attachment.resourceType || (attachment.mimeType?.startsWith("image/") ? "image" : "raw"),
    });
  } catch (_error) {
    // Ignore cleanup races; the request response should reflect the chat failure.
  }
};

const getSafeDownloadName = (name = "attachment") =>
  path.basename(name).replace(/["\r\n]/g, "_") || "attachment";

const getSocketMessage = (message) => ({
  _id: message._id,
  chatId: message.chatId,
  senderId: message.senderId,
  receiverId: message.receiverId,
  messageType: message.messageType,
  text: message.text,
  attachment: message.attachment,
  createdAt: message.createdAt,
  isRead: message.isRead,
  seen: message.seen,
});

const emitChatMessage = (req, message) => {
  const io = req.app.get("io");
  if (!io) return;

  const messageData = getSocketMessage(message);
  io.to(`chat_${message.chatId}`).emit("receiveMessage", messageData);
  io.to(`chat_${message.chatId}`).emit("newMessage", messageData);

  if (message.attachment?.url) {
    io.to(`chat_${message.chatId}`).emit("attachmentMessage", messageData);
  }

  if (message.receiverId) {
    io.to(`user_${message.receiverId}`).emit("newMessageNotification", {
      chatId: message.chatId,
      message: message.text || message.attachment.originalName,
      senderId: message.senderId?._id || message.senderId,
      senderName: message.senderId?.username || "User",
      timestamp: message.createdAt,
      messageType: message.messageType,
    });
  }
};

const createMessageRecord = async ({ chat, senderId, text = "", attachment = null }) => {
  const trimmedText = text?.trim() || "";
  if (!trimmedText && !attachment) {
    throw new Error("Message text or attachment is required");
  }

  const receiverId = getReceiverId(chat, senderId);
  const messageType = attachment
    ? attachment.mimeType.startsWith("image/") ? "image" : "file"
    : "text";

  const message = await Message.create({
    chatId: chat._id,
    senderId,
    receiverId,
    messageType,
    text: trimmedText,
    ...(attachment ? { attachment } : {}),
    isRead: false,
    seen: false,
  });

  await Chat.findByIdAndUpdate(chat._id, {
    lastMessage: getMessagePreview(message),
    updatedAt: new Date(),
  });

  await message.populate("senderId", "username email role profilePicture profileImage");

  if (receiverId) {
    await notifyNewMessage({
      senderId,
      recipientId: receiverId,
      senderName: message.senderId?.username || "User",
      messagePreview: getMessagePreview(message),
      chatId: chat._id,
      messageId: message._id,
    });
  }

  return message;
};

exports.getSocketMessage = getSocketMessage;
exports.emitChatMessage = emitChatMessage;

exports.getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const chat = await getChatForUser(chatId, req.user?._id);

    if (!chat) {
      return res.status(403).json({
        success: false,
        message: "You cannot access messages for this chat",
      });
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const messages = await Message.find({ chatId })
      .populate("senderId", "username email role profilePicture profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));
    const totalCount = await Message.countDocuments({ chatId });

    res.status(200).json({
      success: true,
      messages: messages.reverse(),
      count: messages.length,
      totalCount,
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(totalCount / parseInt(limit, 10)),
    });
  } catch (error) {
    console.error("Get chat messages error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
};

exports.sendChatMessage = async (req, res) => {
  try {
    const chat = await getChatForUser(req.params.chatId, req.user?._id);
    if (!chat) {
      return res.status(403).json({
        success: false,
        message: "You cannot send messages to this chat",
      });
    }

    const message = await createMessageRecord({
      chat,
      senderId: req.user._id,
      text: req.body?.text,
    });

    emitChatMessage(req, message);
    res.status(201).json({ success: true, message });
  } catch (error) {
    res.status(error.message.includes("required") ? 400 : 500).json({
      success: false,
      message: error.message || "Failed to send message",
    });
  }
};

exports.sendChatAttachment = async (req, res) => {
  let attachment = null;

  try {
    const chat = await getChatForUser(req.params.chatId, req.user?._id);
    if (!chat) {
      return res.status(403).json({
        success: false,
        message: "You cannot upload files to this chat",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Attachment file is required",
      });
    }

    const uploaded = await uploadChatAttachmentToCloudinary(req.file.buffer, {
      userId: req.user._id,
      originalName: req.file.originalname,
    });

    attachment = {
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
      resourceType: uploaded.resource_type || (req.file.mimetype.startsWith("image/") ? "image" : "raw"),
      fileName: uploaded.public_id,
      originalName: path.basename(req.file.originalname),
      fileType: path.extname(req.file.originalname).slice(1).toLowerCase(),
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
    };

    const message = await createMessageRecord({
      chat,
      senderId: req.user._id,
      text: req.body?.text,
      attachment,
    });

    emitChatMessage(req, message);
    res.status(201).json({ success: true, message });
  } catch (error) {
    await deleteUploadedChatAttachment(attachment);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send attachment",
    });
  }
};

exports.downloadAttachment = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message?.attachment?.url) {
      return res.status(404).json({
        success: false,
        message: "Attachment not found",
      });
    }

    const chat = await getChatForUser(message.chatId, req.user?._id);
    if (!chat) {
      return res.status(403).json({
        success: false,
        message: "You cannot download this attachment",
      });
    }

    if (/^https?:\/\//i.test(message.attachment.url)) {
      const response = await fetch(message.attachment.url);
      if (!response.ok || !response.body) {
        return res.status(502).json({
          success: false,
          message: "Attachment storage is unavailable",
        });
      }

      const fileName = getSafeDownloadName(message.attachment.originalName || message.attachment.fileName);
      res.setHeader("Content-Type", message.attachment.mimeType || "application/octet-stream");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`
      );
      return Readable.fromWeb(response.body).pipe(res);
    }

    const filePath = path.join(__dirname, "../uploads/chat", path.basename(message.attachment.fileName));
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Attachment file is missing",
      });
    }

    return res.download(filePath, message.attachment.originalName || message.attachment.fileName);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to download attachment",
      error: error.message,
    });
  }
};

exports.createMessage = async (messageData) => {
  const chat = await getChatForUser(messageData.chatId, messageData.senderId);
  if (!chat) {
    throw new Error("You cannot send messages to this chat");
  }

  return createMessageRecord({
    chat,
    senderId: messageData.senderId,
    text: messageData.text,
    attachment: messageData.attachment || null,
  });
};

exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);
    const chat = message ? await getChatForUser(message.chatId, req.user?._id) : null;

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    if (!chat) {
      return res.status(403).json({ success: false, message: "You cannot update this message" });
    }

    if (message.senderId.toString() !== req.user._id.toString() && !message.isRead) {
      message.isRead = true;
      message.seen = true;
      message.readAt = new Date();
      await message.save();
    }

    res.status(200).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to mark message as read", error: error.message });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ success: false, message: "Message not found" });
    if (message.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "You can only delete your own messages" });
    }

    await deleteUploadedChatAttachment(message.attachment);
    await Message.findByIdAndDelete(message._id);
    const lastMessage = await Message.findOne({ chatId: message.chatId }).sort({ createdAt: -1 });
    await Chat.findByIdAndUpdate(message.chatId, { lastMessage: lastMessage ? getMessagePreview(lastMessage) : "" });
    res.status(200).json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete message", error: error.message });
  }
};

exports.editMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ success: false, message: "Message not found" });
    if (message.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "You can only edit your own messages" });
    }
    if (message.messageType !== "text") {
      return res.status(400).json({ success: false, message: "Attachment messages cannot be edited" });
    }
    if (!text?.trim()) {
      return res.status(400).json({ success: false, message: "New text is required" });
    }
    if (Date.now() - new Date(message.createdAt).getTime() > 5 * 60 * 1000) {
      return res.status(403).json({ success: false, message: "Messages can only be edited within 5 minutes of sending" });
    }

    message.text = text.trim();
    message.isEdited = true;
    await message.save();
    res.status(200).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to edit message", error: error.message });
  }
};

exports.markChatAsRead = async (req, res) => {
  try {
    const chat = await getChatForUser(req.params.chatId, req.user?._id);
    if (!chat) {
      return res.status(403).json({ success: false, message: "You cannot update this chat" });
    }

    const result = await Message.updateMany(
      { chatId: chat._id, senderId: { $ne: req.user._id }, isRead: false },
      { isRead: true, seen: true, readAt: new Date() }
    );

    res.status(200).json({
      success: true,
      message: "Messages marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to mark messages as read", error: error.message });
  }
};
