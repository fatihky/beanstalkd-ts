import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import {
  DeadlineSoonError,
  TimedOutError,
} from '../errors';
import {
  BeanstalkdJob,
  type BeanstalkdResponse,
  ReservedResponse,
  DeadlineSoonResponse,
  TimedOutResponse,
} from '../responses';
import { BeanstalkdCommand } from './command';

const cmd = Buffer.from('reserve\r\n');

export class ReserveCommand extends BeanstalkdCommand<BeanstalkdJob, void> {
  override compose(): Buffer {
    return cmd;
  }

  override handle(response: BeanstalkdResponse): BeanstalkdJob {
    if (response instanceof ReservedResponse) {
      return new BeanstalkdJob(response.jobId, response.payload);
    }

    if (response instanceof DeadlineSoonResponse) {
      throw new DeadlineSoonError();
    }

    if (response instanceof TimedOutResponse) {
      throw new TimedOutError();
    }

    throw new BeanstalkdInvalidResponseError(
      'reserve command expects "reserved" response',
    );
  }
}
