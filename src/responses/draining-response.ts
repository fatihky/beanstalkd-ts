import { BeanstalkdResponse } from './beanstalkd-response';

const raw = Buffer.from('DRAINING\r\n');

export class DrainingResponse extends BeanstalkdResponse {
  static readonly raw = raw;
}
