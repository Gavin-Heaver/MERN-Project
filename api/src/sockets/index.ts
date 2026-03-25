import { Server } from "socket.io";

export function registerSocketHandlers(io: Server): void {
    io.on('connection', (socket) => {
        socket.on('user:online', (userId: string) => {
            socket.data.userId = userId
            socket.join(`user:${userId}`)
            io.emit('presence:update', { userId, online: true })
        })

        socket.on('post:join', (postId: string) => socket.join(`post:${postId}`))
        socket.on('post:leave', (postId: string) => socket.leave(`post:${postId}`))

        socket.on('disconnect', () => {
            if (socket.data.userId) {
                io.emit('presence:update', { userId: socket.data.userId, online: false })
            }
        })
    })
}