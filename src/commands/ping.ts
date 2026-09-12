import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import { type BeanstalkdResponse, PongResponse } from '../responses';
import { crlf } from '../utils';
import { BeanstalkdCommand } from './command';

const cmd = Buffer.concat([Buffer.from('ping'), crlf]);

/**
 * beanstalkd-pi extension: a bare liveness check. Always replies "PONG\r\n".
 */
export class PingCommand extends BeanstalkdCommand<void, void> {
  override compose(): Buffer {
    return cmd;
  }

  override handle(response: BeanstalkdResponse): void {
    if (response instanceof PongResponse) return;

    throw new BeanstalkdInvalidResponseError(
      'ping command expects a "pong" response',
    );
  }
}
