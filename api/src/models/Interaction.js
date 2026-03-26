const mongoose = require("mongoose");

const { Schema } = mongoose;

const interactionSchema = new Schema(
{
    fromUserId:
    {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    toUserId:
    {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    type:
    {
        type: String,
        enum: ["pass", "like"],
        required: true
    }
},
{ timestamps: true });

interactionSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

module.exports = mongoose.model("Interaction", interactionSchema);