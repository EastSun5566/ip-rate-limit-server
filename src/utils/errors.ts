/* eslint-disable import/prefer-default-export */
export class OverIpLimitError extends Error {
  status: number;

  ttl: number;

  constructor({ message = 'Over the ip limit', ttl = 60 }: {
    message?: string;
    ttl?: number
  } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.ttl = ttl;
    this.status = 429;
  }
}
