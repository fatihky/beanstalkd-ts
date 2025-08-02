import { BeanstalkdResponse } from './beanstalkd-response';

const raw = Buffer.from('UNKNOWN_COMMAND\r\n');

export class UnknownCommandResponse extends BeanstalkdResponse {
  static readonly raw = raw;
}
