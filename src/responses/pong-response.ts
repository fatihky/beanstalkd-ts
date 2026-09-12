import { BeanstalkdResponse } from './beanstalkd-response';

const raw = Buffer.from('PONG\r\n');

/**
 * beanstalkd-pi extension: reply to the "ping" command.
 */
export class PongResponse extends BeanstalkdResponse {
  static readonly raw = raw;
}
