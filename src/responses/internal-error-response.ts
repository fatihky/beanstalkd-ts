import { BeanstalkdResponse } from './beanstalkd-response';

const raw = Buffer.from('INTERNAL_ERROR\r\n');

export class InternalErrorResponse extends BeanstalkdResponse {
  static readonly raw = raw;
}
