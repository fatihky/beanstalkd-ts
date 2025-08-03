import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import { type BeanstalkdResponse, FoundResponse } from '../responses';
import { BeanstalkdCommand } from './command';

const cmd = Buffer.from('peek-ready\r\n');

export class PeekReadyCommand extends BeanstalkdCommand<FoundResponse, void> {
  override compose(): Buffer {
    return cmd;
  }

  override handle(response: BeanstalkdResponse): FoundResponse {
    if (response instanceof FoundResponse) return response;

    throw new BeanstalkdInvalidResponseError(
      'peek-ready command expects "found" response',
    );
  }
}
