import { BeanstalkdResponse } from './beanstalkd-response';

const raw = Buffer.from('NOT_FOUND\r\n');

export class NotFoundResponse extends BeanstalkdResponse {
  static readonly raw = raw;
}
