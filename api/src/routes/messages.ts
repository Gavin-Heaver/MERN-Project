import { Request, Response, Router } from "express";
import mongoose from "mongoose";
import { authenticate } from "../middleware/auth";

const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Match = require('../models/Match');

const router: Router = Router();

async function getConversation(userId: string, otherUserId: string) {
    let userAId = new mongoose.Types.ObjectId(userId);
    let userBId = new mongoose.Types.ObjectId(otherUserId);

    if (String(userAId) > String(userBId)) {
        const temp = userAId; userAId = userBId; userBId = temp;
    }

    const match = await Match.findOne({ userAId, userBId, status: 'active' });
    if (!match) return null;

    return Conversation.findOne({ matchId: match._id, status: 'active' });
}

// GET /message/conversations
router.get('/conversations', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user?.id);
        const debugUser = await mongoose.model('User').findById(userId).lean();
        console.log('User fields:', JSON.stringify(debugUser, null, 2));

        const conversations = await Conversation.find({
            participantIds: userId,
            status: 'active'
        })
            .populate('matchId')
            .populate({
                path: 'participantIds',
                select: 'basicInfo.firstName basicInfo.lastName',
                model: 'User'
            })
            .sort({ lastMessageAt: -1 });

        res.json({ conversations });
    } catch (err) {
        console.error('Get conversations error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /message/:conversationId
router.get('/:conversationId', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { conversationId } = req.params;

        const conversation = await Conversation.findOne({
            _id: conversationId,
            participantIds: userId,
            status: 'active'
        }).populate('participantIds', 'basicInfo');

        if (!conversation) {
            res.status(404).json({ message: 'Conversation not found' });
            return;
        }

        const messages = await Message.find({
            conversationId,
            status: { $ne: 'deleted' }       // never return deleted messages
        }).sort({ createdAt: 1 });

        // Mark unread messages as read
        await Message.updateMany(
            {
                conversationId,
                senderId: { $ne: userId },    // not sent by me
                status: 'sent',               // not already read
                'readBy.userId': { $ne: userId }
            },
            {
                $set: { status: 'read' },
                $push: { readBy: { userId, readAt: new Date() } }
            }
        );

        res.json({ conversation, messages });
    } catch (err) {
        console.error('Get messages error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /message/send-msg
router.post('/send-msg', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const fromUserId = req.user?.id;
        const { toUserId, text } = req.body;

        if (!toUserId || !text?.trim()) {
            res.status(400).json({ message: 'toUserId and text are required' });
            return;
        }

        if (fromUserId === toUserId) {
            res.status(400).json({ message: 'You cannot message yourself' });
            return;
        }

        const conversation = await getConversation(fromUserId, toUserId);

        if (!conversation) {
            res.status(403).json({ message: 'You can only message users you are matched with' });
            return;
        }

        const message = await Message.create({
            conversationId: conversation._id,
            senderId: fromUserId,
            messageType: 'text',
            text: text.trim(),
        });

        conversation.lastMessageAt = message.createdAt;
        conversation.lastMessagePreview = text.trim().slice(0, 100);
        await conversation.save();

        res.status(201).json({ message });
    } catch (err) {
        console.error('Send message error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;