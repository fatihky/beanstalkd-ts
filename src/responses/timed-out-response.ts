import { BeanstalkdResponse } from './beanstalkd-response';

const raw = Buffer.from('TIMED_OUT\r\n');

export class TimedOutResponse extends BeanstalkdResponse {
  static readonly raw = raw;
}
