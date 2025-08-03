import { BeanstalkdResponse } from './beanstalkd-response';

const raw = Buffer.from('TOUCHED\r\n');

export class TouchedResponse extends BeanstalkdResponse {
  static readonly raw = raw;
}
