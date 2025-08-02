import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import { BuriedError } from '../errors';
import {
  type BeanstalkdResponse,
  BuriedResponse,
  ReleasedResponse,
} from '../responses';
import { BeanstalkdCommand } from './command';

interface ReleseParam {
  delay: number;
  jobId: number;
  pri: number;
}

export class ReleaseCommand extends BeanstalkdCommand<
  ReleasedResponse,
  ReleseParam
> {
  override compose(param: ReleseParam): Buffer {
    return Buffer.from(
      `release ${param.jobId} ${param.pri} ${param.delay}\r\n`,
    );
  }

  override handle(response: BeanstalkdResponse): ReleasedResponse {
    if (response instanceof BuriedResponse) {
      throw new BuriedError();
    }

    if (response instanceof ReleasedResponse) {
      return response;
    }

    throw new BeanstalkdInvalidResponseError(
      'release command expects "released response"',
    );
  }
}
