const Chat = require("../models/chatbox.model.js");
const Message = require("../models/message.model.js");
const User = require("../models/user.model.js");
const Application = require("../models/application.model.js");

const isParticipant = (chat, userId) =>
  chat.participants.some((participant) => participant.toString() === userId.toString());

// Create or get existing chat between users (only with candidates)
exports.createOrGetChat = async (req, res) => {
  try {
    const { participantId, jobId } = req.body;
    const currentUser = req.user;
    const currentUserId = currentUser?._id;

    if (!participantId || !currentUserId) {
      return res.status(400).json({
        success: false,
        message: "Both user IDs are required",
      });
    }

    const participant = await User.findById(participantId);
    if (!participant || participant.accountStatus === "Blocked") {
      return res.status(400).json({
        success: false,
        message: "Participant is not available",
      });
    }

    const validRolePair = [currentUser.role, participant.role].sort().join(":") === "candidate:recruiter";
    if (!validRolePair) {
      return res.status(400).json({
        success: false,
        message: "Chats are available only between candidates and recruiters",
      });
    }

    if (currentUser.role === "candidate") {
      const application = await Application.findOne({
        candidateId: currentUserId,
        recruiterId: participantId,
        ...(jobId ? { jobId } : {}),
      }).select("_id jobId");

      if (!application) {
        return res.status(403).json({
          success: false,
          message: "Apply to a recruiter job before starting a chat",
        });
      }
    }

    // Check if chat already exists between these users
    let chat = await Chat.findOne({
      participants: { $all: [currentUserId, participantId] },
    }).populate("participants", "username email role profilePicture profileImage");

    // If no chat exists, create new one
    if (!chat) {
      chat = await Chat.create({
        participants: [currentUserId, participantId],
        ...(jobId && { jobId }),
      });
      chat = await chat.populate("participants", "username email role profilePicture profileImage");
    }

    res.status(200).json({
      success: true,
      chat,
    });
  } catch (error) {
    console.error("Create/Get chat error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create or get chat",
      error: error.message,
    });
  }
};

// Get all chats for the current user (only chats with candidates)
exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Get all chats where user is participant
    let chats = await Chat.find({
      participants: userId,
    })
      .populate("participants", "username email role profilePicture profileImage")
      .populate("jobId", "title company")
      .sort({ updatedAt: -1 });

    // Keep only candidate-recruiter conversations.
    chats = chats.filter(chat => {
      const roles = new Set(chat.participants.map((participant) => participant.role));
      return roles.has("candidate") && roles.has("recruiter");
    });

    // Get last message for each chat
    const chatsWithLastMessage = await Promise.all(
      chats.map(async (chat) => {
        const lastMessage = await Message.findOne({ chatId: chat._id })
          .sort({ createdAt: -1 })
          .populate("senderId", "username");
        
        const chatObj = chat.toObject();
        chatObj.lastMessage = lastMessage?.text || lastMessage?.attachment?.originalName || null;
        chatObj.lastMessageTime = lastMessage?.createdAt || chat.updatedAt;
        chatObj.lastMessageSender = lastMessage?.senderId?._id || null;
        
        // Count unread messages
        const unreadCount = await Message.countDocuments({
          chatId: chat._id,
          senderId: { $ne: userId },
          isRead: false,
        });
        chatObj.unreadCount = unreadCount;
        
        return chatObj;
      })
    );

    res.status(200).json({
      success: true,
      chats: chatsWithLastMessage,
      count: chatsWithLastMessage.length,
    });
  } catch (error) {
    console.error("Get user chats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user chats",
      error: error.message,
    });
  }
};

// Get a specific chat by ID (verify it's with a candidate)
exports.getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user?._id;

    const chat = await Chat.findById(chatId)
      .populate("participants", "username email role profilePicture profileImage")
      .populate("jobId", "title company");

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    const belongsToUser = chat.participants.some((participant) => participant._id.toString() === userId.toString());
    if (!belongsToUser) {
      return res.status(403).json({
        success: false,
        message: "You cannot access this chat",
      });
    }

    res.status(200).json({
      success: true,
      chat,
    });
  } catch (error) {
    console.error("Get chat by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch chat",
      error: error.message,
    });
  }
};

// Delete a chat
exports.deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user?._id;

    // Verify user is participant
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    if (!isParticipant(chat, userId)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this chat",
      });
    }

    // Delete all messages in the chat
    await Message.deleteMany({ chatId });

    // Delete the chat
    await Chat.findByIdAndDelete(chatId);

    res.status(200).json({
      success: true,
      message: "Chat and all messages deleted successfully",
    });
  } catch (error) {
    console.error("Delete chat error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete chat",
      error: error.message,
    });
  }
};

// Mark all messages in a chat as read
exports.markChatAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user?._id;

    if (!chatId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Chat ID and User ID are required",
      });
    }

    const chat = await Chat.findById(chatId);
    if (!chat || !isParticipant(chat, userId)) {
      return res.status(403).json({
        success: false,
        message: "You cannot update this chat",
      });
    }

    const result = await Message.updateMany(
      { chatId, senderId: { $ne: userId }, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json({
      success: true,
      message: "Messages marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Mark chat as read error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark messages as read",
      error: error.message,
    });
  }
};

// Get all available candidates for chatting
exports.getAvailableCandidates = async (req, res) => {
  try {
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    let candidates = [];
    if (req.user.role === "recruiter") {
      candidates = await User.find({
        role: "candidate",
        _id: { $ne: userId },
        accountStatus: { $ne: "Blocked" },
      }).select("username email role profilePicture profileImage fullName jobProfession");
    } else if (req.user.role === "candidate") {
      const recruiterIds = await Application.distinct("recruiterId", {
        candidateId: userId,
      });
      candidates = await User.find({
        role: "recruiter",
        _id: { $in: recruiterIds },
        accountStatus: { $ne: "Blocked" },
      }).select("username email role profilePicture profileImage fullName");
    }

    // Get existing chats to see which candidates already have chats
    const existingChats = await Chat.find({
      participants: userId,
    }).populate("participants", "_id");

    const existingCandidateIds = new Set();
    existingChats.forEach(chat => {
      chat.participants.forEach(participant => {
        if (participant._id.toString() !== userId) {
          existingCandidateIds.add(participant._id.toString());
        }
      });
    });

    // Mark candidates that already have chats
    const candidatesWithStatus = candidates.map(candidate => ({
      ...candidate.toObject(),
      hasExistingChat: existingCandidateIds.has(candidate._id.toString()),
    }));

    res.status(200).json({
      success: true,
      candidates: candidatesWithStatus,
      count: candidatesWithStatus.length,
    });
  } catch (error) {
    console.error("Get available candidates error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch candidates",
      error: error.message,
    });
  }
};
