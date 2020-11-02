import { IMiddleware } from 'koa-router';

import { getRedisClient } from '../models/db/redis';
import { IPModel } from '../models';
import { IPRateLimitService } from '../services';
import { config } from '../config';

export const rateLimiter: IMiddleware = async (ctx, next) => {
  const store = getRedisClient();
  const ipRateLimitService = new IPRateLimitService({ IP: new IPModel(store) });

  const { ip } = ctx;
  const { count, ttl } = await ipRateLimitService.checkIPCount({ ip });

  const { max } = config.ipRateLimit;
  ctx.set({
    'X-rateLimit-Limit': `${max}`,
    'X-Rate-Limit-Remaining': `${max - count}`,
    'X-RateLimit-Reset': `${Date.now() + ttl}`,
  });

  if (count > max) {
    ctx.throw(429, 'Too Many Requests');
    return;
  }

  next();
};

export default rateLimiter;
