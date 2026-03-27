import 'dotenv/config'
import './config/env'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

import { connectMongo } from './config/db'
import { registerSocketHandlers } from './sockets/index'
import authRoutes from './routes/auth'
import postRoutes from './routes/posts'
import { config } from './config/env'

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
    cors: { origin: config.clientUrl, methods: ['GET', 'POST'] }
})

app.set('io', io)
app.use(cors({ origin: config.clientUrl }))
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

app.use('/api/auth', authRoutes)
app.use('/api/posts', postRoutes)

registerSocketHandlers(io)

;(async () => {
    await connectMongo()
    httpServer.listen(config.port, () => {
        console.log(`API running on http://localhost:${config.port}`)
    })
})()