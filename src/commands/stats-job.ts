import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import { NotFoundError } from '../errors';
import {
  type BeanstalkdResponse,
  JobStats,
  OkResponse,
  NotFoundResponse,
} from '../responses';
import { BeanstalkdCommand } from './command';

export class StatsJobCommand extends BeanstalkdCommand<JobStats, number> {
  override compose(jobId: number): Buffer {
    return Buffer.from(`stats-job ${jobId}\r\n`);
  }

  override handle(response: BeanstalkdResponse): JobStats {
    if (response instanceof NotFoundResponse) {
      throw new NotFoundError();
    }

    if (!(response instanceof OkResponse))
      throw new BeanstalkdInvalidResponseError(
        'stats-job command expects "ok" response',
      );

    return new JobStats(response.data.toString('ascii'));
  }
}
