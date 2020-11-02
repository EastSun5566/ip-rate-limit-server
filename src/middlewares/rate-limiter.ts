import { IMiddleware } from 'koa-router';

import { getRedisClient } from '../db/redis';
import { IPModel } from '../models';
import { IPRateLimitService } from '../services';
import { config } from '../config';

export const rateLimiter: IMiddleware = async (ctx, next) => {
  const store = getRedisClient();
  const ipRateLimitService = new IPRateLimitService({ IP: new IPModel(store) });

  const { ip } = ctx;
  try {
    const { count, ttl } = await ipRateLimitService.checkIPCount({ ip });

    const { max } = config.ipRateLimit;
    ctx.set({
      'X-rateLimit-Limit': `${max}`,
      'X-Rate-Limit-Remaining': `${max - count}`,
      'X-RateLimit-Reset': `${Date.now() + (ttl * 1000)}`,
    });

    ctx.state.clientInfo = { ip, count, ttl };
  } catch (err) {
    if (err.message === 'exceed the limit') {
      ctx.throw(429, 'Too many requests');
      return;
    }

    throw err;
  }

  next();
};

export default rateLimiter;
