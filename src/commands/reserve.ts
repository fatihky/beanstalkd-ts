import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import { type BeanstalkdResponse, ReservedResponse } from '../responses';
import { BeanstalkdCommand } from './command';

const cmd = Buffer.from('reserve\r\n');

export class ReserveCommand extends BeanstalkdCommand<ReservedResponse, void> {
  override compose(): Buffer {
    return cmd;
  }

  override handle(response: BeanstalkdResponse): ReservedResponse {
    if (response instanceof ReservedResponse) {
      return response;
    }

    throw new BeanstalkdInvalidResponseError(
      'reserve command expects "reserved response"',
    );
  }
}
