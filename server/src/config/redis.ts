import Redis from 'ioredis';

declare global {
  var redis: Redis | undefined;
}

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = global.redis || new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    if (times > 3) return null;
    return Math.min(times * 100, 3000);
  },
});

if (process.env.NODE_ENV !== 'production') {
  global.redis = redis;
}

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message);
});

redis.on('connect', () => {
  console.log('✅ Redis connected');
});

export async function connectRedis(): Promise<void> {
  try {
    await redis.ping();
    console.log('✅ Redis connection verified');
  } catch (error) {
    console.warn('⚠️ Redis not available - queues will run in-process');
  }
}

export async function disconnectRedis(): Promise<void> {
  await redis.quit();
  console.log('🔌 Redis disconnected');
}