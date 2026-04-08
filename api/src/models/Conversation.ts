const mongoose = require("mongoose");

const { Schema } = mongoose;

const conversationSchema = new Schema(
{
    matchId:
    {
        type: Schema.Types.ObjectId,
        ref: "Match",
        required: true,
        unique: true
    },
    participantIds:
    {
        type: [{
            type: Schema.Types.ObjectId,
            ref: "User"
        }],
        validate:
        {
            validator: function(value)
            {
                return (
                    Array.isArray(value) &&
                    value.length === 2 &&
                    value[0].toString() !== value[1].toString()
                );
            },
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

conversationSchema.pre("validate", async function(next)
{
    if (Array.isArray(this.participantIds) && this.participantIds.length === 2)
    {
        this.participantIds = this.participantIds
            .map(id => id.toString())
            .sort()
            .map(id => new mongoose.Types.ObjectId(id));
    }

});

module.exports = mongoose.model("Conversation", conversationSchema);