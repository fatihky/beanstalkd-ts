import { BeanstalkdResponse } from './beanstalkd-response';

const raw = Buffer.from('KICKED\r\n');

/**
 * This response is returned when a job successfully kicked/moved into the "ready" queue.
 */
export class JobKickedResponse extends BeanstalkdResponse {
  static readonly raw = raw;
}
