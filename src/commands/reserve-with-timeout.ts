import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import {
  BeanstalkdJob,
  type BeanstalkdResponse,
  ReservedResponse,
} from '../responses';
import { BeanstalkdCommand } from './command';

export class ReserveWithTimeoutCommand extends BeanstalkdCommand<
  BeanstalkdJob,
  number
> {
  override compose(timeoutSeconds: number): Buffer {
    return Buffer.from(`reserve-with-timeout ${timeoutSeconds}\r\n`);
  }

  override handle(response: BeanstalkdResponse): BeanstalkdJob {
    if (response instanceof ReservedResponse) {
      return new BeanstalkdJob(response.jobId, response.payload);
    }

    throw new BeanstalkdInvalidResponseError(
      'reserve-with-timeout command expects "reserved response"',
    );
  }
}
