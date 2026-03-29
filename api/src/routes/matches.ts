import { Request, Response, Router } from "express";
import { authenticate } from "../middleware/auth";

const Match = require('../models/Match');

const router: Router = Router();

router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;

        const matches = await Match.find({
            $or: [{ userAId: userId }, { userBId: userId }],
            status: 'active'
        })
        .populate('userAId', 'email displayName')
        .populate('userBId', 'email displayName')
        .populate('conversationId');

        res.json({ matches });
    } catch (err) {
        console.error('Get matches error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;