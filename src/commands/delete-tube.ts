import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import { type BeanstalkdResponse, TubeDeletedResponse } from '../responses';
import { BeanstalkdCommand } from './command';

/**
 * beanstalkd-pi extension: deletes every ready, delayed, and buried job in
 * the named tube outright.
 *
 * @throws {NotFoundError} if the named tube does not exist.
 */
export class DeleteTubeCommand extends BeanstalkdCommand<
  TubeDeletedResponse,
  string
> {
  override compose(tube: string): Buffer {
    return Buffer.from(`delete-tube ${tube}\r\n`);
  }

  override handle(response: BeanstalkdResponse): TubeDeletedResponse {
    if (response instanceof TubeDeletedResponse) return response;

    throw new BeanstalkdInvalidResponseError(
      'delete-tube command expects a "deleted" response',
    );
  }
}
