import mongoose, { InferSchemaType } from 'mongoose'

const matchSchema = new mongoose.Schema(
{
    userAId:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    userBId:
    {
        type: mongoose.Schema.Types.ObjectId,
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
        type: mongoose.Schema.Types.ObjectId,
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

matchSchema.pre("validate", async function(next)
{
    if (!this.userAId || !this.userBId) return

    if (this.userAId.equals(this.userBId))
    {
        throw new Error("A user cannot match with themselves.");
    }

    if (String(this.userAId) > String(this.userBId))
    {
        const temp = this.userAId;
        this.userAId = this.userBId;
        this.userBId = temp;
    }
});

matchSchema.index({ userAId: 1, userBId: 1 }, { unique: true });

module.exports = mongoose.model("Match", matchSchema);