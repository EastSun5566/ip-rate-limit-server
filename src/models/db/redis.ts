import Redis from 'ioredis';

let redisClient: Redis.Redis;

export const getRedisClient = (): Redis.Redis => {
  if (redisClient) return redisClient;

  redisClient = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: +process.env.REDIS_PORT || 6379,
  });

  return redisClient;
};

export default getRedisClient;
