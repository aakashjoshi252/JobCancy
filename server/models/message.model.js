const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    chatId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Chat", 
      required: true 
    },
    senderId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
    },
    text: { 
      type: String, 
      default: "",
      maxlength: 4000,
      validate: {
        validator(value) {
          return Boolean(value?.trim()) || Boolean(this.attachment?.url);
        },
        message: "Message text or attachment is required",
      },
    },
    attachment: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
      resourceType: { type: String, default: "" },
      fileName: { type: String, default: "" },
      originalName: { type: String, default: "" },
      fileType: { type: String, default: "" },
      mimeType: { type: String, default: "" },
      fileSize: { type: Number, default: 0 },
    },
    isRead: { 
      type: Boolean, 
      default: false 
    },
    readAt: {
      type: Date,
      default: null,
    },
    seen: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

messageSchema.pre("validate", function syncReadFlags(next) {
  if (this.isModified("isRead")) {
    this.seen = this.isRead;
  }
  next();
});

// Check if model already exists before creating
module.exports = mongoose.models.Message || mongoose.model("Message", messageSchema);
