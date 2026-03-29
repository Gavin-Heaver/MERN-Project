"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Post_1 = require("../models/Post");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const posts = await Post_1.Post.find()
            .sort({ createdAt: -1 })
            .populate('author', 'displayName email');
        res.json(posts);
    }
    catch (err) {
        console.error('Get posts error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
router.get('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const post = await Post_1.Post.findById(req.params.id)
            .populate('author', 'displayName email')
            .populate('comments.author', 'displayName');
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }
        res.json(post);
    }
    catch (err) {
        console.error('Get post error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
router.post('/', auth_1.authenticate, async (req, res) => {
    const { title, body } = req.body;
    if (!title || !body) {
        res.status(400).json({ message: 'Title and body are required' });
        return;
    }
    try {
        const created = await Post_1.Post.create({ title, body, author: req.user.id });
        const post = await Post_1.Post.findById(created._id).populate('author', 'displayName email');
        res.status(201).json(post);
    }
    catch (err) {
        console.error('Create post error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
router.post('/:id/comments', auth_1.authenticate, async (req, res) => {
    const { body } = req.body;
    if (!body) {
        res.status(400).json({ message: 'Comment body is required' });
        return;
    }
    try {
        const post = await Post_1.Post.findById(req.params.id);
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }
        post.comments.push({ author: req.user.id, body });
        await post.save();
        req.app.get('io').to(`post:${post._id}`).emit('comment:new', {
            postId: post._id,
            comment: post.comments.at(-1)
        });
        res.status(201).json(post);
    }
    catch (err) {
        console.error('Add comment error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const post = await Post_1.Post.findById(req.params.id);
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }
        // Only the author can delete their own post
        if (post.author.toString() !== req.user.id) {
            res.status(403).json({ message: 'Not authorized ' });
            return;
        }
        await post.deleteOne();
        res.json({ message: 'Post deleted' });
    }
    catch (err) {
        console.error('Delete post error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=posts.js.map