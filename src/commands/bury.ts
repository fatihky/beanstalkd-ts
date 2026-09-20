import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import { NotFoundError } from '../errors';
import { type BeanstalkdResponse, BuriedResponse, NotFoundResponse } from '../responses';
import { BeanstalkdCommand } from './command';

interface BuryParam {
  jobId: number;
  pri: number;
}

export class BuryCommand extends BeanstalkdCommand<BuriedResponse, BuryParam> {
  override compose(param: BuryParam): Buffer {
    return Buffer.from(`bury ${param.jobId} ${param.pri}\r\n`);
  }

  override handle(response: BeanstalkdResponse): BuriedResponse {
    if (response instanceof BuriedResponse) {
      return response;
    }

    if (response instanceof NotFoundResponse) {
      throw new NotFoundError();
    }

    throw new BeanstalkdInvalidResponseError(
      'bury command expects "buried" response',
    );
  }
}
