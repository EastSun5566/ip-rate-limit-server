import { IMiddleware } from 'koa-router';

import { IPRateLimitService } from '../services';
import { config } from '../config';
import { OverIpLimitError } from '../utils/errors';

export const rateLimiter = (
  ipRateLimitService: IPRateLimitService,
): IMiddleware => async (ctx, next) => {
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

  await next();
};

export default rateLimiter;
