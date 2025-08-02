import { BeanstalkdResponse } from './beanstalkd-response';

const raw = Buffer.from('OUT_OF_MEMORY\r\n');

export class OutOfMemoryResponse extends BeanstalkdResponse {
  static readonly raw = raw;
}
