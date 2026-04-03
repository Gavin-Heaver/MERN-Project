import { Request, Response, Router } from "express";
import { authenticate } from "../middleware/auth";
import { Post } from "../models/Post";

const router: Router = Router()

router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate('author', 'displayName email')
        res.json(posts)
    } catch (err) {
        console.error('Get posts error:', err)
        res.status(500).json({ message: 'Server error' })
    }
})

router.get('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'displayName email')
            .populate('comments.author', 'displayName')
        if (!post) { res.status(404).json({ message: 'Post not found' }); return }
        res.json(post)
    } catch (err) {
        console.error('Get post error:', err)
        res.status(500).json({ message: 'Server error' })
    }
})

router.post('/', authenticate, async (req: Request, res: Response): Promise<void> => {
    const { title, body } = req.body
    if (!title || !body) { res.status(400).json({ message: 'Title and body are required' }); return }
    try {
        const created = await Post.create({ title, body, author: req.user.id })
        const post = await Post.findById(created._id).populate('author', 'email basicInfo')
        res.status(201).json(post)
    } catch (err) {
        console.error('Create post error:', err)
        res.status(500).json({ message: 'Server error' })
    }
})

router.post('/:id/comments', authenticate, async (req: Request, res: Response): Promise<void> => {
    const { body } = req.body
    if (!body) { res.status(400).json({ message: 'Comment body is required' }); return }
    try {
        const post = await Post.findById(req.params.id)
        if (!post) { res.status(404).json({ message: 'Post not found' }); return }

        post.comments.push({ author: req.user.id, body } as any)
        await post.save()

        req.app.get('io').to(`post:${post._id}`).emit('comment:new', {
            postId: post._id,
            comment: post.comments.at(-1)
        })

        res.status(201).json(post)
    } catch (err) {
        console.error('Add comment error:', err)
        res.status(500).json({ message: 'Server error' })
    }
})

router.delete('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post) { res.status(404).json({ message: 'Post not found' }); return }

        // Only the author can delete their own post
        if (post.author.toString() !== req.user.id) {
            res.status(403).json({ message: 'Not authorized '})
            return
        }
        
        await post.deleteOne()
        res.json({ message: 'Post deleted' })
    } catch (err) {
        console.error('Delete post error:', err)
        res.status(500).json({ message: 'Server error' })
    }
})

export default router