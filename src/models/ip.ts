import { Redis } from 'ioredis';
import { config } from '../config';

export class IPModel {
  static PREFIX_KEY = 'ip:'

  // eslint-disable-next-line no-useless-constructor
  constructor(public store: Redis) {}

  async increaseCount({
    ip,
    expiredSec = config.ipRateLimit.windowSec,
  }: {
    ip: string;
    expiredSec?: number;
  }): Promise<{
    count: number;
    ttl: number;
  }> {
    const key = IPModel.PREFIX_KEY + ip;

    const [, [, count], [, ttl]] = await this.store
      .multi()
      .set(key, 0, 'EX', expiredSec, 'NX')
      .incr(key)
      .ttl(key)
      .exec();

    return { count, ttl };
  }
}

export default IPModel;
