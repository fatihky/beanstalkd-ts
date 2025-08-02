import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import { type BeanstalkdResponse, BuriedResponse } from '../responses';
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

    throw new BeanstalkdInvalidResponseError(
      'release command expects "released response"',
    );
  }
}
