import { Server } from 'http';
import { promisify } from 'util';
import { Redis } from 'ioredis';
import supertest, { SuperTest, Test } from 'supertest';

import { config } from '../../src/config';
import { createServer } from '../../src/server';
import { getRedisClient } from '../../src/db';
import { IPModel } from '../../src/models';

const sendConcurrencyRequests = ({
  request,
  concurrency,
  ip,
}: {
  request: SuperTest<Test>;
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

const createIPCount = async ({
  store,
  ip,
  count,
  expiredSec,
}: {
  store: Redis;
  ip: string;
  count: number
  expiredSec: number;
}) => {
  const ipModel = new IPModel(store);

  return Promise.all(
    Array.from(
      { length: count },
      () => ipModel.increaseCount({ ip, expiredSec }),
    ),
  );
};

const sleep = (ms: number) => promisify(setTimeout)(ms);

describe('GET /', () => {
  const IP = '192.168.0.1';
  const { max, windowSec } = config.ipRateLimit;

  let app: Server;
  let request: SuperTest<Test>;
  let store: Redis;

  beforeAll(() => {
    app = createServer();
    request = supertest(app);
    store = getRedisClient();
  });

  afterEach(async () => {
    await store.flushdb();
  });

  afterAll(() => {
    app.close();
    store.disconnect();
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

  it(`should return 200 with count 1 when already send ${max} of requests after ${windowSec + 1}s`, async () => {
    const expiredSec = 1;

    await createIPCount({
      store,
      ip: IP,
      count: max,
      expiredSec,
    });

    await sleep((expiredSec + 1) * 1000);

    const [res] = await sendConcurrencyRequests({ request, concurrency: 1, ip: IP });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ip', IP);
    expect(res.body).toHaveProperty('count', 1);
  });
});
