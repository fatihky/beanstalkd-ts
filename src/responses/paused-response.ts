import { BeanstalkdResponse } from './beanstalkd-response';

const raw = Buffer.from('PAUSED\r\n');

export class PausedResponse extends BeanstalkdResponse {
  static readonly raw = raw;
}
