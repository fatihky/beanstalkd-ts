import { BeanstalkdResponse } from './beanstalkd-response';

const raw = Buffer.from('JOB_TOO_BIG\r\n');

export class JobTooBigResponse extends BeanstalkdResponse {
  static readonly raw = raw;
}
