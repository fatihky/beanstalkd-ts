import { BeanstalkdResponse } from './beanstalkd-response';

const raw = Buffer.from('RELEASED\r\n');

export class ReleasedResponse extends BeanstalkdResponse {
  static readonly raw = raw;
}
