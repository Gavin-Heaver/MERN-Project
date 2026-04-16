import { Request, Response, Router } from "express";
import mongoose from "mongoose";
import { authenticate } from "../middleware/auth";
import { User } from "../models/User";

const Interaction = require('../models/Interaction');
const Match = require('../models/Match');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const router: Router = Router();

router.post('/', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const fromUserId = req.user?.id;
        const { toUserId, type } = req.body;

        if (!toUserId || !type) {
            res.status(400).json({ message: 'toUserId and type are required' });
            return;
        }

        const targetUserExists = await User.exists({ _id: toUserId });
        if (!targetUserExists) {
            res.status(404).json({ message: 'The user you are trying to interact with does not exist' });
            return;
        }

        if (!['like', 'pass'].includes(type)) {
            res.status(400).json({ message: 'type must be like or pass' });
            return;
        }

        if (fromUserId === toUserId) {
            res.status(400).json({ message: 'You cannot interact with yourself' });
            return;
        }

        const interaction = await Interaction.findOneAndUpdate(
            { fromUserId, toUserId },
            { fromUserId, toUserId, type },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        if (type === 'pass') {
            res.json({ interaction, matched: false });
            return;
        }

        const reverseLike = await Interaction.findOne({
            fromUserId: toUserId,
            toUserId: fromUserId,
            type: 'like'
        });

        if (!reverseLike) {
            res.json({ interaction, matched: false });
            return;
        }

        let userAId = new mongoose.Types.ObjectId(fromUserId);
        let userBId = new mongoose.Types.ObjectId(toUserId);

        if (String(userAId) > String(userBId)) {
            const temp = userAId;
            userAId = userBId;
            userBId = temp;
        }

        let match = await Match.findOne({ userAId, userBId });

        if (!match) {
            match = await Match.create({
                userAId,
                userBId,
                status: 'active'
            });

            const conversation = await Conversation.create({
                matchId: match._id,
                participantIds: [userAId, userBId],
                status: 'active'
            });

            match.conversationId = conversation._id;
            await match.save();
        }

        res.json({
            interaction,
            matched: true,
            match
        });
    } catch (err) {
        console.error('Create interaction error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/unmatch/:otherUserIdIn', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const currentUserId = req.user.id
        const { otherUserIdIn } = req.params
        const otherUserId = otherUserIdIn as string

        console.log(currentUserId, otherUserId, otherUserIdIn)

        if (!currentUserId || !otherUserId) {
            res.status(400).json({ message: 'Missing user IDs' })
            return
        }

        let userAId = new mongoose.Types.ObjectId(currentUserId)
        let userBId = new mongoose.Types.ObjectId(otherUserId)

        if (String(userAId) > String(userBId)) {
            const temp = userAId
            userAId = userBId
            userBId = temp
        }

        const match = await Match.findOne({
            userAId,
            userBId,
            status: 'active'
        })

        if (!match) {
            res.status(404).json({ message: 'Match not found' })
            return
        }

        const conversation = await Conversation.findOne({
            matchId: match._id,
            status: 'active'
        })

        console.log('CONVO')
        console.log(conversation)

        if (conversation) {
            const deletedMessages = await Message.deleteMany({
                conversationId: conversation.id
            })

            await Conversation.findByIdAndDelete(conversation.id)
        }

        await Match.findByIdAndDelete(match._id);

        res.json({ message: 'Unmatched successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/:matchId', authenticate, async (req: Request, res: Response) => {
    try {
        const { matchId } = req.params;
        await Match.findByIdAndDelete(matchId);
        res.json({ message: 'Unmatched successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});



export default router;