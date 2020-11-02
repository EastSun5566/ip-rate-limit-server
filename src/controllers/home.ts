import { Context } from 'koa';

export class HomeController {
  // eslint-disable-next-line class-methods-use-this
  get(ctx: Context): void {
    const { clientInfo } = ctx.state;
    ctx.body = clientInfo;
  }
}

export default HomeController;
