import { BeanstalkdResponse } from './beanstalkd-response';

const raw = Buffer.from('BURIED\r\n');

export class BuriedResponse extends BeanstalkdResponse {
  static readonly raw = raw;
}
