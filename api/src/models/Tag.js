const mongoose = require("mongoose");

const { Schema } = mongoose;

const tagSchema = new Schema(
{
    name:
    {
        type: String,
        required: true,
        trim: true
    },
    normalizedName:
    {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    },
    createdByUserId:
    {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    active:
    {
        type: Boolean,
        default: true
    }
},
{ timestamps: true });

module.exports = mongoose.model("Tag", tagSchema);