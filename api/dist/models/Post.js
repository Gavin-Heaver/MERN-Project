"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Post = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const commentSchema = new mongoose_1.default.Schema({
    author: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true },
}, { timestamps: true });
const postSchema = new mongoose_1.default.Schema({
    author: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    comments: [commentSchema],
}, { timestamps: true });
exports.Post = mongoose_1.default.model('Post', postSchema);
//# sourceMappingURL=Post.js.map