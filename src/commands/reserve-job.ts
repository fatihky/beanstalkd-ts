import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import {
  BeanstalkdJob,
  type BeanstalkdResponse,
  ReservedResponse,
} from '../responses';
import { BeanstalkdCommand } from './command';

export class ReserveJobCommand extends BeanstalkdCommand<
  BeanstalkdJob,
  number
> {
  override compose(jobId: number): Buffer {
    return Buffer.from(`reserve-job ${jobId}\r\n`);
  }

  override handle(response: BeanstalkdResponse): BeanstalkdJob {
    if (response instanceof ReservedResponse) {
      return new BeanstalkdJob(response.jobId, response.payload);
    }

    throw new BeanstalkdInvalidResponseError(
      'reserve-job command expects "reserved response"',
    );
  }
}
