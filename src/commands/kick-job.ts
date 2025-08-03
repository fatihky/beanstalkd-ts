import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import { type BeanstalkdResponse, JobKickedResponse } from '../responses';
import { BeanstalkdCommand } from './command';

/**
 * Kick/move a specific job into the "ready" queue.
 *
 * From beanstalkd docs:
 *
 * The kick-job command is a variant of kick that operates with a single job
 * identified by its job id. If the given job id exists and is in a buried or
 * delayed state, it will be moved to the ready queue of the the same tube where it
 * currently belongs. The syntax is:
 */
export class KickJobCommand extends BeanstalkdCommand<
  JobKickedResponse,
  number
> {
  override compose(jobId: number): Buffer {
    return Buffer.from(`kick-job ${jobId}\r\n`);
  }

  override handle(response: BeanstalkdResponse): JobKickedResponse {
    if (response instanceof JobKickedResponse) {
      return response;
    }

    throw new BeanstalkdInvalidResponseError(
      'kick-job command expects "job kicked" response',
    );
  }
}
