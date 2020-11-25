import { IMiddleware } from 'koa-router';

import { getRedisClient } from '../db';
import { IPModel } from '../models';
import { IPRateLimitService } from '../services';
import { config } from '../config';
import { OverIpLimitError } from '../utils/errors';

export const rateLimiter: IMiddleware = async (ctx, next) => {
  const store = getRedisClient();
  const ipRateLimitService = new IPRateLimitService({ IP: new IPModel(store) });

  const { ip } = ctx;
  try {
    const { count, ttl } = await ipRateLimitService.checkIPCount({ ip });

    const { max } = config.ipRateLimit;
    ctx.set({
      'X-RateLimit-Limit': `${max}`,
      'X-Rate-Limit-Remaining': `${max - count}`,
      'X-RateLimit-Reset': `${Math.ceil(Date.now() / 1000) + ttl}`,
    });

    ctx.state.clientInfo = { ip, count, ttl };
  } catch (err) {
    if (err instanceof OverIpLimitError) {
      ctx.set({ 'Retry-After': `${err.ttl}` });
      throw err;
    }

    throw err;
  }

  next();
};

export default rateLimiter;
