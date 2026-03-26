const mongoose = require("mongoose");

const { Schema } = mongoose;

const readBySchema = new Schema(
{
    userId:
    {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    readAt:
    {
        type: Date,
        default: Date.now
    }
},
{ _id: false });

const messageSchema = new Schema(
{
    conversationId:
    {
        type: Schema.Types.ObjectId,
        ref: "Conversation",
        required: true
    },
    senderId:
    {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    messageType:
    {
        type: String,
        enum: ["text", "system"],
        default: "text"
    },
    text:
    {
        type: String,
        trim: true,
        default: ""
    },
    status:
    {
        type: String,
        enum: ["sent", "read", "deleted"],
        default: "sent"
    },
    readBy:
    {
        type: [readBySchema],
        default: []
    }
},
{ timestamps: true });

messageSchema.pre("validate", function(next)
{
    if ((this.messageType === "text" || this.messageType === "system") && !this.text.trim())
    {
        return next(new Error("Text is required for messages."));
    }

    next();
});

messageSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);