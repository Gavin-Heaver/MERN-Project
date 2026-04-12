import mongoose from 'mongoose'

const tagSchema = new mongoose.Schema(
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
        type: mongoose.Schema.Types.ObjectId,
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

tagSchema.pre("validate", function()
{
    if (this.name)
    {
        this.normalizedName = this.name.trim().toLowerCase();
    }
});

module.exports = mongoose.model("Tag", tagSchema);