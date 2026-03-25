import mongoose, { InferSchemaType }  from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        body: { type: String, required: true },
    },
    { timestamps: true }
)

const postSchema = new mongoose.Schema(
    {
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true, trim: true },
        body: { type: String, required: true, trim: true },
        comments: [commentSchema],
    },
    { timestamps: true }
)

export type PostType = InferSchemaType<typeof postSchema>
export type CommentType = InferSchemaType<typeof commentSchema>
export const Post = mongoose.model('Post', postSchema)