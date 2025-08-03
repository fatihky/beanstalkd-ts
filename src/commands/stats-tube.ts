import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import { type BeanstalkdResponse, OkResponse, TubeStats } from '../responses';
import { BeanstalkdCommand } from './command';

export class StatsTubeCommand extends BeanstalkdCommand<TubeStats, string> {
  override compose(tube: string): Buffer {
    return Buffer.from(`stats-tube ${tube}\r\n`);
  }

  override handle(response: BeanstalkdResponse): TubeStats {
    if (!(response instanceof OkResponse))
      throw new BeanstalkdInvalidResponseError(
        'stats-tube command expects "ok" response',
      );

    return new TubeStats(response.data.toString('ascii'));
  }
}
