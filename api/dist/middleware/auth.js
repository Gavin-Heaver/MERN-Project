"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
function authenticate(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        res.status(401).json({ message: 'No token provided' });
        return;
    }
    const token = header.split(' ')[1];
    try {
        req.user = jsonwebtoken_1.default.verify(token, env_1.config.jwtSecret);
        next();
    }
    catch {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
}
//# sourceMappingURL=auth.js.map