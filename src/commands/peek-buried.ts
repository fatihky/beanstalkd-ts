import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import { type BeanstalkdResponse, FoundResponse } from '../responses';
import { BeanstalkdCommand } from './command';

const cmd = Buffer.from('peek-buried\r\n');

export class PeekBuriedCommand extends BeanstalkdCommand<FoundResponse, void> {
  override compose(): Buffer {
    return cmd;
  }

  override handle(response: BeanstalkdResponse): FoundResponse {
    if (response instanceof FoundResponse) return response;

    throw new BeanstalkdInvalidResponseError(
      'peek-buried command expects "found" response',
    );
  }
}
