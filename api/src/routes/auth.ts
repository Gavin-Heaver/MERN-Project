import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken"
import { User } from "../models/User";
import { config } from "../config/env";

const router: Router = Router()

router.post('/register', async (req: Request, res: Response): Promise<void> => {
    const { email, password, displayName, basicInfo } = req.body

    if (!email || !password || !displayName || !basicInfo) {
        res.status(400).json({ message: 'All fields are required' })
        return
    }

    try {
        const existing = await User.findOne({ email })
        if (existing) {
            res.status(409).json({ message: 'Email already registered' })
            return
        }

        const user = await User.create({ email, password, displayName, basicInfo })
        const token = jwt.sign(
            { id: user._id, email: user.email },
            config.jwtSecret,
            { expiresIn: config.jwtExpiresIn }
        )

        res.status(201).json({
            token,
            user: { id: user._id, email: user.email, displayName: user.displayName }
        })
    } catch (err: any) {
        if (err.name === 'ValidationError') {
            res.status(400).json({ message: err.message })
            return
        }
        console.error('Register error:', err)
        res.status(500).json({ message: 'Server error' })
    }
})

router.post('/login', async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body

    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' })
        return
    }

    try {
        const user = await User.findOne({ email }).select('+password')
        if (!user) { res.status(401).json({ message: 'Invalid credentials' }); return }

        const valid = await user.comparePassword(password)
        if (!valid) { res.status(401).json({ message: 'Invalid credentials' }); return }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            config.jwtSecret,
            { expiresIn: config.jwtExpiresIn }
        )

        res.json({
            token,
            user: { id: user._id, email: user.email, displayName: user.displayName }
        })
    } catch (err) {
        console.error('Login error:', err)
        res.status(500).json({ message: 'Server error'})
    }
})

export default router