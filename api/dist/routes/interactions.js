"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = require("../middleware/auth");
const Interaction = require('../models/Interaction');
const Match = require('../models/Match');
const Conversation = require('../models/Conversation');
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const fromUserId = req.user?.id;
        const { toUserId, type } = req.body;
        if (!toUserId || !type) {
            res.status(400).json({ message: 'toUserId and type are required' });
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
        const interaction = await Interaction.findOneAndUpdate({ fromUserId, toUserId }, { fromUserId, toUserId, type }, { new: true, upsert: true, setDefaultsOnInsert: true });
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
        let userAId = new mongoose_1.default.Types.ObjectId(fromUserId);
        let userBId = new mongoose_1.default.Types.ObjectId(toUserId);
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
    }
    catch (err) {
        console.error('Create interaction error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=interactions.js.map