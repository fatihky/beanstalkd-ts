import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import { type BeanstalkdResponse, ReservedResponse } from '../responses';
import { BeanstalkdCommand } from './command';

export class ReserveJobCommand extends BeanstalkdCommand<
  ReservedResponse,
  number
> {
  override compose(jobId: number): Buffer {
    return Buffer.from(`reserve-job ${jobId}\r\n`);
  }

  override handle(response: BeanstalkdResponse): ReservedResponse {
    if (response instanceof ReservedResponse) {
      return response;
    }

    throw new BeanstalkdInvalidResponseError(
      'reserve-job command expects "reserved response"',
    );
  }
}
