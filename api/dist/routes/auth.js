"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const env_1 = require("../config/env");
const router = (0, express_1.Router)();
router.post('/register', async (req, res) => {
    const { email, password, displayName } = req.body;
    if (!email || !password || !displayName) {
        res.status(400).json({ message: 'All fields are required' });
        return;
    }
    try {
        const existing = await User_1.User.findOne({ email });
        if (existing) {
            res.status(409).json({ message: 'Email already registered' });
            return;
        }
        const user = await User_1.User.create({ email, password, displayName });
        const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email }, env_1.config.jwtSecret, { expiresIn: env_1.config.jwtExpiresIn });
        res.status(201).json({
            token,
            user: { id: user._id, email: user.email, displayName: user.displayName }
        });
    }
    catch (err) {
        if (err.name === 'ValidationError') {
            res.status(400).json({ message: err.message });
            return;
        }
        console.error('Register error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
    }
    try {
        const user = await User_1.User.findOne({ email }).select('+password');
        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        const valid = await user.comparePassword(password);
        if (!valid) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email }, env_1.config.jwtSecret, { expiresIn: env_1.config.jwtExpiresIn });
        res.json({
            token,
            user: { id: user._id, email: user.email, displayName: user.displayName }
        });
    }
    catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map