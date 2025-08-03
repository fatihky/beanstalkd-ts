import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import { type BeanstalkdResponse, JobStats, OkResponse } from '../responses';
import { BeanstalkdCommand } from './command';

export class StatsJobCommand extends BeanstalkdCommand<JobStats, number> {
  override compose(jobId: number): Buffer {
    return Buffer.from(`stats-job ${jobId}\r\n`);
  }

  override handle(response: BeanstalkdResponse): JobStats {
    if (!(response instanceof OkResponse))
      throw new BeanstalkdInvalidResponseError(
        'stats-job command expects "ok" response',
      );

    return new JobStats(response.data.toString('ascii'));
  }
}
