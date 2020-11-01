import Router, { RouterContext as Context } from 'koa-router';

import {
  HomeController,
} from './controllers';
import {
  HomeService,
} from './services';

export interface Route {
  path: string;
  method: 'get' | 'post' | 'put' | 'link' | 'unlink' | 'delete' | 'del' | 'head' | 'options' | 'patch' | 'all';
  handler: (ctx: Context) => any;
}

export const createRouter = (router: Router): Router => {
  const homeController = new HomeController(new HomeService());

  const routes: Route[] = [
    {
      path: '/',
      method: 'get',
      handler: homeController.get,
    },
  ];

  routes.forEach(({ path, method, handler }) => {
    router[method](path, handler);
  });

  return router;
};

export default createRouter;
