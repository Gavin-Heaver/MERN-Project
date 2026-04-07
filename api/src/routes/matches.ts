import { Request, Response, Router } from "express";
import { authenticate } from "../middleware/auth";

const Interaction = require('../models/Interaction');
const Match = require('../models/Match');

const router: Router = Router();

router.get('/getAll', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const matches = await Match.find({
            $or: [
                { userAId: userId },
                { userBId: userId }
            ]
        })
        .populate('userAId', 'firstName lastName profilePic') 
        .populate('userBId', 'firstName lastName profilePic')
        .sort({ createdAt: -1 }); 

        const formattedMatches = matches.map((match: any) => {
            const isUserA = match.userAId._id.toString() === userId;
            const otherUser = isUserA ? match.userBId : match.userAId;

            return {
                matchId: match._id,
                matchedAt: match.createdAt,
                otherUser
            };
        });

        res.json(formattedMatches);

    } catch (err) {
        console.error('Fetch matches error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/', authenticate, async (req: Request, res: Response) => {
    try {
        const fromUserId = req.user?.id;
        const { toUserId, type } = req.body;

        if (!fromUserId || !toUserId || !type) {
            return res.status(400).json({ message: 'Missing fields' });
        }

        if (fromUserId === toUserId) {
            return res.status(400).json({ message: 'Cannot interact with yourself' });
        }

        // 1️⃣ Save interaction (or update if exists)
        const interaction = await Interaction.findOneAndUpdate(
            { fromUserId, toUserId },
            { type },
            { upsert: true, new: true }
        );

        let match = null;

        // 2️⃣ Only check for match if it's a LIKE
        if (type === "like") {
            const reverseLike = await Interaction.findOne({
                fromUserId: toUserId,
                toUserId: fromUserId,
                type: "like"
            });

            // 3️⃣ If both liked each other → create match
            if (reverseLike) {
                const [userAId, userBId] = [fromUserId, toUserId].sort();
                try {
                    match = await Match.findOneAndUpdate(
                        { userAId, userBId },
                        { userAId, userBId },
                        { upsert: true, new: true }
                    );
    } catch (err) {
        console.error('Match creation error:', err);
        // Fallback or specific error handling
    }
            }
        }

        res.json({
            interaction,
            match, // will be null unless mutual like
            isMatch: !!match
        });

    } catch (err) {
        console.error('Interaction error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;