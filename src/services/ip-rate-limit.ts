import { IPModel } from '../models';
import { config } from '../config';
import { OverIpLimitError } from '../utils/errors';

export class IPRateLimitService {
  // eslint-disable-next-line no-useless-constructor
  constructor(public models: { ip: IPModel }) {}

  async checkIPCount({ ip }: { ip: string }): Promise<{
    count: number;
    ttl: number;
  }> {
    const { max } = config.ipRateLimit;
    const { count, ttl } = await this.models.ip.increaseCount({ ip });

    if (count > max) throw new OverIpLimitError({ ttl });

    return { count, ttl };
  }
}

export default IPRateLimitService;
