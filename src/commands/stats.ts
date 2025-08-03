import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import { type BeanstalkdResponse, OkResponse, ServerStats } from '../responses';
import { crlf } from '../utils';
import { BeanstalkdCommand } from './command';

const cmd = Buffer.concat([Buffer.from('stats'), crlf]);

export class StatsCommand extends BeanstalkdCommand<ServerStats, void> {
  override compose(): Buffer {
    return cmd;
  }

  override handle(response: BeanstalkdResponse) {
    if (!(response instanceof OkResponse))
      throw new BeanstalkdInvalidResponseError();

    return new ServerStats(response.data.toString());
  }
}
