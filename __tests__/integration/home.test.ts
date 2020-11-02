import { Server } from 'http';
import supertest from 'supertest';

import { config } from '../../config';
import { createApp } from '../../src/app';
import { getRedisClient } from '../../src/db/redis';

type Request = supertest.SuperTest<supertest.Test>;

const sendConcurrencyRequests = ({
  request,
  concurrency,
  ip,
}: {
  request: Request;
  concurrency: number;
  ip: string;
}) => Promise.all(
  Array.from(
    { length: concurrency },
    () => request
      .get('/')
      .set('X-Forwarded-For', ip),
  ),
);

describe('GET /', () => {
  const IP = '192.168.0.0';
  const { max, windowSec } = config.ipRateLimit;

  let app: Server;
  let request: Request;

  beforeEach(() => {
    app = createApp();
    request = supertest(app);
  });

  afterEach(async () => {
    app.close();
    await getRedisClient().flushdb();
  });

  it(`should return 200 with count when # of requests is less than ${max} in ${windowSec}s`, async () => {
    const count = 5;

    const res = await sendConcurrencyRequests({ request, concurrency: count, ip: IP });

    expect(res[count - 1].status).toBe(200);
    expect(res[count - 1].body).toHaveProperty('ip', IP);
    expect(res[count - 1].body).toHaveProperty('count', count);
  });

  it(`should return 429 with error message when # of requests is more than ${max} in ${windowSec}s`, async () => {
    const count = max + 1;

    const res = await sendConcurrencyRequests({ request, concurrency: count, ip: IP });

    expect(res[count - 1].status).toBe(429);
    expect(res[count - 1].body).toHaveProperty('status', 429);
    expect(res[count - 1].body).toHaveProperty('message', 'too many requests');
  });

  // it(`should return 200 with count when already send max # of requests after ${windowSec + 1}s`, async () => {
  // });
});
