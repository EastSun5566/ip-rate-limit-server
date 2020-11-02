import { Redis } from 'ioredis';
import { config } from '../config';

const KEY_PREFIX = 'ip:';

export class IPModel {
  // eslint-disable-next-line no-useless-constructor
  constructor(public store: Redis) {}

  async increaseCount({ ip }: { ip: string }): Promise<{
    count: number;
    resetTime: number;
  }> {
    const { ipRateLimit: { windowSec } } = config;
    const key = KEY_PREFIX + ip;

    const [, [, count], [, ttl]] = await this.store
      .multi()
      .set(key, 0, 'EX', windowSec, 'NX')
      .incr(key)
      .ttl(key)
      .exec();

    return {
      count,
      resetTime: ttl,
    };
  }
}

export default IPModel;
