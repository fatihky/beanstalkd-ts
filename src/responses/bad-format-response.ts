import { BeanstalkdResponse } from './beanstalkd-response';

const raw = Buffer.from('BAD_FORMAT\r\n');

export class BadFormatResponse extends BeanstalkdResponse {
  static readonly raw = raw;
}
