import { BeanstalkdResponse } from './beanstalkd-response';

const raw = Buffer.from('NOT_IGNORED\r\n');

export class NotIgnoredResponse extends BeanstalkdResponse {
  static readonly raw = raw;
}
