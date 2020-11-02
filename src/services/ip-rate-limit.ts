import { IPModel } from '../models';

export class IPRateLimitService {
  // eslint-disable-next-line no-useless-constructor
  constructor(public models: { IP: IPModel }) {}
}

export default IPRateLimitService;
