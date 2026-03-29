"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const required = [
    'MONGO_URI',
    'JWT_SECRET',
    'CLIENT_URL'
];
for (const key of required) {
    if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
}
exports.config = {
    mongoUri: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: 60 * 60 * 24 * 7,
    clientUrl: process.env.CLIENT_URL,
    port: Number(process.env.PORT) || 3001
};
//# sourceMappingURL=env.js.map