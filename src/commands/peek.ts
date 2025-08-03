import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import { type BeanstalkdResponse, FoundResponse } from '../responses';
import { BeanstalkdCommand } from './command';

export class PeekCommand extends BeanstalkdCommand<FoundResponse, number> {
  override compose(jobId: number): Buffer {
    return Buffer.from(`peek ${jobId}\r\n`);
  }

  override handle(response: BeanstalkdResponse): FoundResponse {
    if (response instanceof FoundResponse) return response;

    throw new BeanstalkdInvalidResponseError(
      'peek command expects a "found" respose',
    );
  }
}
