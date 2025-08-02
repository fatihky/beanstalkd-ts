import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import { type BeanstalkdResponse, ReservedResponse } from '../responses';
import { BeanstalkdCommand } from './command';

export class ReserveWithTimeoutCommand extends BeanstalkdCommand<
  ReservedResponse,
  number
> {
  override compose(timeoutSeconds: number): Buffer {
    return Buffer.from(`reserve-with-timeout ${timeoutSeconds}\r\n`);
  }

  override handle(response: BeanstalkdResponse): ReservedResponse {
    if (response instanceof ReservedResponse) {
      return response;
    }

    throw new BeanstalkdInvalidResponseError(
      'reserve-with-timeout command expects "reserved response"',
    );
  }
}
