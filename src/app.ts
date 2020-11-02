import { Server } from 'http';

import Koa from 'koa';
import Router from 'koa-router';
import logger from 'koa-logger';

import { createRouter } from './router';
import { errorHandler, rateLimiter } from './middlewares';

export const createApp = (): Server => {
  const router = createRouter(new Router());

  const port = process.env.PORT || 8080;

  const app = new Koa()
    .use(logger())
    .use(errorHandler)
    .use(rateLimiter)
    .use(router.routes())
    .use(router.allowedMethods())
    .listen(port, () => {
      console.info(`[HTTP] listening on http://localhost:${port}`);
    });

  return app;
};
export default createApp;
