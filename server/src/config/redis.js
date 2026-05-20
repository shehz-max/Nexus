"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
exports.connectRedis = connectRedis;
exports.disconnectRedis = disconnectRedis;
const ioredis_1 = __importDefault(require("ioredis"));
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
exports.redis = global.redis || new ioredis_1.default(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
        if (times > 3)
            return null;
        return Math.min(times * 100, 3000);
    },
});
if (process.env.NODE_ENV !== 'production') {
    global.redis = exports.redis;
}
exports.redis.on('error', (err) => {
    console.error('❌ Redis connection error:', err.message);
});
exports.redis.on('connect', () => {
    console.log('✅ Redis connected');
});
async function connectRedis() {
    try {
        await exports.redis.ping();
        console.log('✅ Redis connection verified');
    }
    catch (error) {
        console.warn('⚠️ Redis not available - queues will run in-process');
    }
}
async function disconnectRedis() {
    await exports.redis.quit();
    console.log('🔌 Redis disconnected');
}
//# sourceMappingURL=redis.js.map