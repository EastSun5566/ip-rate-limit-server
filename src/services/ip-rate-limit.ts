import { IPModel } from '../models';
import { config } from '../config';

export class IPRateLimitService {
  // eslint-disable-next-line no-useless-constructor
  constructor(public models: { IP: IPModel }) {}

  async checkIPCount({ ip }: { ip: string }): Promise<{
    count: number;
    ttl: number;
  }> {
    const { ipRateLimit } = config;
    const { count, ttl } = await this.models.IP.increaseCount({ ip });

    if (count > ipRateLimit.max) throw new Error('over the max');

    return {
      count,
      ttl,
    };
  }
}

export default IPRateLimitService;
