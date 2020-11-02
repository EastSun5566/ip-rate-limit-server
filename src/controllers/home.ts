import { Context } from 'koa';

interface IHomeController {
  get(ctx: Context): void;
}

export class HomeController implements IHomeController {
  get = (ctx: Context): void => {
    ctx.body = 'Hello world';
  }
}

export default HomeController;
