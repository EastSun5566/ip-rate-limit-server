import { Server } from 'http';

import Koa from 'koa';
import Router from 'koa-router';

import { createRouter } from './router';
import { errorHandler, rateLimiter } from './middlewares';

import { getRedisClient } from './redis';
import { IPModel } from './models';
import { IPRateLimitService } from './services';

export const createServer = (): Server => {
  const router = createRouter(new Router());

  const app = new Koa()
    .use(errorHandler())
    .use(rateLimiter(new IPRateLimitService({ ip: new IPModel(getRedisClient()) })))
    .use(router.routes())
    .use(router.allowedMethods());

  app.proxy = true;
  const port = process.env.PORT || 8080;
  const server = app.listen(port);

  console.info(`[HTTP] listening on http://localhost:${port}`);

  return server;
};
export default createServer;
