import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken'
import { config } from '../config/env'

export function authenticate(req: Request, res: Response, next: NextFunction): void {
    const header = req.headers.authorization

    if (!header?.startsWith('Bearer ')) {
        res.status(401).json({ message: 'No token provided' })
        return
    }

    const token = header.split(' ')[1]

    try {
        req.user = jwt.verify(token, config.jwtSecret) as Request['user']
        next()
    } catch {
        res.status(401).json({ message: 'Invalid or expired token' })
    }
}