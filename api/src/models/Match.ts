const mongoose = require("mongoose");

const { Schema } = mongoose;

const matchSchema = new Schema(
{
    userAId:
    {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    userBId:
    {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status:
    {
        type: String,
        enum: ["active", "unmatched", "blocked"],
        default: "active"
    },
    conversationId:
    {
        type: Schema.Types.ObjectId,
        ref: "Conversation",
        default: null
    },
    lastActivityAt:
    {
        type: Date,
        default: Date.now
    }
},
{ timestamps: true });

matchSchema.pre("validate", function(next)
{
    if (!this.userAId || !this.userBId)
    {
        return next();
    }

    if (this.userAId.equals(this.userBId))
    {
        return next(new Error("A user cannot match with themselves."));
    }

    if (String(this.userAId) > String(this.userBId))
    {
        const temp = this.userAId;
        this.userAId = this.userBId;
        this.userBId = temp;
    }

    next();
});

matchSchema.index({ userAId: 1, userBId: 1 }, { unique: true });

module.exports = mongoose.model("Match", matchSchema);