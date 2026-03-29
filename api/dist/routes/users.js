"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = require("../middleware/auth");
const User_1 = require("../models/User");
const Interaction = require('../models/Interaction');
const router = (0, express_1.Router)();
router.get('/me', auth_1.authenticate, async (req, res) => {
    try {
        const user = await User_1.User.findById(req.user?.id).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json({ user });
    }
    catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
router.put('/me', auth_1.authenticate, async (req, res) => {
    try {
        const { displayName, bio, age, major, year } = req.body;
        const updateData = {};
        if (displayName !== undefined)
            updateData.displayName = displayName;
        if (bio !== undefined)
            updateData.bio = bio;
        if (age !== undefined)
            updateData.age = age;
        if (major !== undefined)
            updateData.major = major;
        if (year !== undefined)
            updateData.year = year;
        const user = await User_1.User.findByIdAndUpdate(req.user?.id, updateData, { new: true, runValidators: true }).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json({ user });
    }
    catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
router.get('/discover', auth_1.authenticate, async (req, res) => {
    try {
        const currentUserId = new mongoose_1.default.Types.ObjectId(req.user?.id);
        const interactions = await Interaction.find({ fromUserId: currentUserId }).select('toUserId');
        const excludedIds = interactions.map((i) => i.toUserId);
        excludedIds.push(currentUserId);
        const users = await User_1.User.find({
            _id: { $nin: excludedIds }
        })
            .select('-password')
            .limit(20);
        res.json({ users });
    }
    catch (err) {
        console.error('Discover users error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map