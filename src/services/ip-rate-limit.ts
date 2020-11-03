import { IPModel } from '../models';
import { config } from '../config';

export class IPRateLimitService {
  // eslint-disable-next-line no-useless-constructor
  constructor(public models: { IP: IPModel }) {}

  async checkIPCount({ ip }: { ip: string }): Promise<{
    count: number;
    ttl: number;
  }> {
    const { max } = config.ipRateLimit;
    const { count, ttl } = await this.models.IP.increaseCount({ ip });

    if (count > max) throw new Error('exceed the limit');

    return {
      count,
      ttl,
    };
  }
}

export default IPRateLimitService;
