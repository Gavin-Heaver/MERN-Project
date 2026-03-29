import { Request, Response, Router } from "express";
import mongoose from "mongoose";
import { authenticate } from "../middleware/auth";
import { User } from "../models/User";

const Interaction = require('../models/Interaction');

const router: Router = Router();

router.get('/me', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user?.id).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.json({ user });
    } catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/me', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const { displayName, bio, age, major, year } = req.body;

        const updateData: any = {};
        if (displayName !== undefined) updateData.displayName = displayName;
        if (bio !== undefined) updateData.bio = bio;
        if (age !== undefined) updateData.age = age;
        if (major !== undefined) updateData.major = major;
        if (year !== undefined) updateData.year = year;

        const user = await User.findByIdAndUpdate(
            req.user?.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.json({ user });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/discover', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const currentUserId = new mongoose.Types.ObjectId(req.user?.id);

        const interactions = await Interaction.find({ fromUserId: currentUserId }).select('toUserId');
        const excludedIds = interactions.map((i: any) => i.toUserId);
        excludedIds.push(currentUserId);

        const users = await User.find({
            _id: { $nin: excludedIds }
        })
        .select('-password')
        .limit(20);

        res.json({ users });
    } catch (err) {
        console.error('Discover users error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;