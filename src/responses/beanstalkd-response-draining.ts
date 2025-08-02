import { BeanstalkdResponse } from './beanstalkd-response';

export class BeanstalkdResponseDraining extends BeanstalkdResponse {
  static readonly data = Buffer.from('DRAINING\r\n');
}
