import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import {
  type BeanstalkdResponse,
  ConnectionStats,
  OkResponse,
} from '../responses';
import { BeanstalkdCommand } from './command';

/**
 * beanstalkd-pi extension: introspection stats about a connection. With no
 * `id`, reports on the calling connection itself.
 *
 * @throws {NotFoundError} if `id` is given and no connection with that id
 * currently exists.
 */
export class StatsConnCommand extends BeanstalkdCommand<
  ConnectionStats,
  number | undefined
> {
  override compose(id?: number): Buffer {
    return Buffer.from(
      id === undefined ? 'stats-conn\r\n' : `stats-conn ${id}\r\n`,
    );
  }

  override handle(response: BeanstalkdResponse): ConnectionStats {
    if (!(response instanceof OkResponse))
      throw new BeanstalkdInvalidResponseError();

    return new ConnectionStats(response.data.toString());
  }
}
