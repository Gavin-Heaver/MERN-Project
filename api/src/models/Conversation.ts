import mongoose, { InferSchemaType } from "mongoose";

const conversationSchema = new mongoose.Schema(
{
    matchId:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Match",
        required: true,
        unique: true
    },
    participantIds:
    {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
        validate:
        {
            validator: (value: mongoose.Types.ObjectId[]) =>
                Array.isArray(value) &&
                value.length === 2 &&
                value[0].toString() !== value[1].toString(),
            message: "A conversation must have exactly 2 participants."
        },
        required: true
    },
    lastMessageAt:
    {
        type: Date,
        default: null
    },
    lastMessagePreview:
    {
        type: String,
        default: ""
    },
    status:
    {
        type: String,
        enum: ["active", "hidden", "closed"],
        default: "active"
    }
},
{ timestamps: true });

conversationSchema.pre("validate", function()
{
    if (Array.isArray(this.participantIds) && this.participantIds.length === 2)
    {
        this.participantIds = this.participantIds
            .map((id: mongoose.Types.ObjectId) => id.toString())
            .sort()
            .map((id: string) => new mongoose.Types.ObjectId(id));
    }

});

module.exports = mongoose.model("Conversation", conversationSchema);