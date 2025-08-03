import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import { type BeanstalkdResponse, FoundResponse } from '../responses';
import { BeanstalkdCommand } from './command';

const cmd = Buffer.from('peek-delayed\r\n');

export class PeekDelayedCommand extends BeanstalkdCommand<FoundResponse, void> {
  override compose(): Buffer {
    return cmd;
  }

  override handle(response: BeanstalkdResponse): FoundResponse {
    if (response instanceof FoundResponse) return response;

    throw new BeanstalkdInvalidResponseError(
      'peek-delayed command expects "found" response',
    );
  }
}
