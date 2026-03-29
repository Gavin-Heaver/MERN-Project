"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
require("./config/env");
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./config/db");
const index_1 = require("./sockets/index");
const auth_1 = __importDefault(require("./routes/auth"));
const posts_1 = __importDefault(require("./routes/posts"));
const users_1 = __importDefault(require("./routes/users"));
const interactions_1 = __importDefault(require("./routes/interactions"));
const matches_1 = __importDefault(require("./routes/matches"));
const env_1 = require("./config/env");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: { origin: env_1.config.clientUrl, methods: ['GET', 'POST'] }
});
app.set('io', io);
app.use((0, cors_1.default)({ origin: env_1.config.clientUrl }));
app.use(express_1.default.json());
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', auth_1.default);
app.use('/api/posts', posts_1.default);
app.use('/api/users', users_1.default);
app.use('/api/interactions', interactions_1.default);
app.use('/api/matches', matches_1.default);
(0, index_1.registerSocketHandlers)(io);
(async () => {
    await (0, db_1.connectMongo)();
    httpServer.listen(env_1.config.port, () => {
        console.log(`API running on http://localhost:${env_1.config.port}`);
    });
})();
//# sourceMappingURL=index.js.map