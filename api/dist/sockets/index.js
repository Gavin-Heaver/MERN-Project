"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSocketHandlers = registerSocketHandlers;
function registerSocketHandlers(io) {
    io.on('connection', (socket) => {
        socket.on('user:online', (userId) => {
            socket.data.userId = userId;
            socket.join(`user:${userId}`);
            io.emit('presence:update', { userId, online: true });
        });
        socket.on('post:join', (postId) => socket.join(`post:${postId}`));
        socket.on('post:leave', (postId) => socket.leave(`post:${postId}`));
        socket.on('disconnect', () => {
            if (socket.data.userId) {
                io.emit('presence:update', { userId: socket.data.userId, online: false });
            }
        });
    });
}
//# sourceMappingURL=index.js.map