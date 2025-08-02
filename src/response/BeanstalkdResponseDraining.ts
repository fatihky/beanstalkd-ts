import { BeanstalkdResponse } from './BeanstalkdResponse';

export class BeanstalkdResponseDraining extends BeanstalkdResponse {
  static readonly data = Buffer.from('DRAINING\r\n');
}
