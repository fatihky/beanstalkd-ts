import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import { type BeanstalkdResponse, TouchedResponse } from '../responses';
import { BeanstalkdCommand } from './command';

export class TouchCommand extends BeanstalkdCommand<TouchedResponse, number> {
  override compose(jobId: number): Buffer {
    return Buffer.from(`touch ${jobId}\r\n`);
  }

  override handle(response: BeanstalkdResponse): TouchedResponse {
    if (response instanceof TouchedResponse) {
      return response;
    }

    throw new BeanstalkdInvalidResponseError(
      'touch command expects "touched" response',
    );
  }
}
