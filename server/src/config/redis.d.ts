import Redis from 'ioredis';
declare global {
    var redis: Redis | undefined;
}
export declare const redis: Redis;
export declare function connectRedis(): Promise<void>;
export declare function disconnectRedis(): Promise<void>;
//# sourceMappingURL=redis.d.ts.map