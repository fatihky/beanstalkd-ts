import { BeanstalkdResponse } from './beanstalkd-response';

const raw = Buffer.from('DEADLINE_SOON\r\n');

export class DeadlineSoonResponse extends BeanstalkdResponse {
  static readonly raw = raw;
}
