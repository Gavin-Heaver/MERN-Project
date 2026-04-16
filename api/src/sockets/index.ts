import { Server, Socket } from "socket.io";

export function registerSocketHandlers(io: Server): void {
    io.on('connection', (socket: Socket) => {
        console.log('Socket connected:', socket.id)

        socket.on('user:online', (userId: string) => {
            socket.data.userId = userId
            socket.join(`user:${userId}`)
            console.log(`User ${userId} online (socket ${socket.id})`)
            io.emit('presence:update', { userId, online: true })
        })

        socket.on('conversation:join', (data: { conversationId: string; userId: string }) => {
            const { conversationId, userId } = data
            socket.join(`conversation:${conversationId}`)
            socket.data.conversationId = conversationId
            socket.data.userId = userId
            console.log(`User ${userId} joined conversation ${conversationId}`)
        })

        socket.on('conversation:leave', (data: { conversationId: string; userId: string }) => {
            const { conversationId } = data
            socket.leave(`conversation:${conversationId}`)
            console.log(`User left conversation ${conversationId}`)
        })

        socket.on('disconnect', () => {
            console.log('Socket disconnected:', socket.id)
            if (socket.data.userId) {
                io.emit('presence:update', { userId: socket.data.userId, online: false })
            }
        })
    })
}

export function emitMessageToConversation(io: Server, conversationId: string, message: any, recipientUserId: string) {
    io.to(`conversation:${conversationId}`).emit('message:new', message)
    console.log(`Emitted message to conversation ${conversationId}`)

    io.to(`user:${recipientUserId}`).emit('conversation:update', {
        conversationId,
        lastMessageAt: message.createdAt,
        lastMessagePreview: message.text.slice(0, 100)
    })
}