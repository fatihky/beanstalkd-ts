import { BeanstalkdResponse } from './beanstalkd-response';

const raw = Buffer.from('DELETED\r\n');

export class DeletedResponse extends BeanstalkdResponse {
  static readonly raw = raw;
}
