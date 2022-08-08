import Redis, { Redis as RedisClient } from 'ioredis';

let redisClient: RedisClient;

export const getRedisClient = (): RedisClient => {
  if (redisClient) return redisClient;

  const { REDIS_HOST, REDIS_PORT } = process.env;
  redisClient = new Redis({
    host: REDIS_HOST || '127.0.0.1',
    port: (REDIS_PORT && +REDIS_PORT) || 6379,
  });

  return redisClient;
};

export default getRedisClient;
