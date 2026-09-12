import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import {
  type BeanstalkdResponse,
  ConnectionStats,
  OkResponse,
} from '../responses';
import { YamlPayload } from '../responses/utils/yaml-payload';
import { crlf } from '../utils';
import { BeanstalkdCommand } from './command';

const cmd = Buffer.concat([Buffer.from('list-connections'), crlf]);

/**
 * beanstalkd-pi extension: the same fields as "stats-conn", for every
 * currently connected client.
 */
export class ListConnectionsCommand extends BeanstalkdCommand<
  ConnectionStats[],
  void
> {
  override compose(): Buffer {
    return cmd;
  }

  override handle(response: BeanstalkdResponse): ConnectionStats[] {
    if (!(response instanceof OkResponse))
      throw new BeanstalkdInvalidResponseError();

    return YamlPayload.splitSequenceEntries(response.data.toString()).map(
      (entry) => new ConnectionStats(entry),
    );
  }
}
