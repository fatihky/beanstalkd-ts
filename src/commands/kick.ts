import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import { type BeanstalkdResponse, KickedResponse } from '../responses';
import { BeanstalkdCommand } from './command';

export class KickCommand extends BeanstalkdCommand<KickedResponse, number> {
  override compose(jobCount: number): Buffer {
    return Buffer.from(`kick ${jobCount}\r\n`);
  }

  override handle(response: BeanstalkdResponse): KickedResponse {
    if (response instanceof KickedResponse) return response;

    throw new BeanstalkdInvalidResponseError(
      `kick command expects a "kicked" response`,
    );
  }
}
