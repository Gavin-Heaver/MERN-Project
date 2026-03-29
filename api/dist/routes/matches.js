"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Match = require('../models/Match');
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticate, async (req, res) => {
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
    }
    catch (err) {
        console.error('Get matches error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=matches.js.map