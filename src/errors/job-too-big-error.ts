import { BeanstalkdError } from './beanstalkd-error';

/**
 * job payload exceeded the server's limit. (default: 2**16)
 */
export class JobTooBigError extends BeanstalkdError {
  override name = 'JobTooBigError';
}
