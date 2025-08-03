import { BeanstalkdError } from './beanstalkd-error';

/**
 * Given job or tube not found.
 */
export class NotFoundError extends BeanstalkdError {
  override name = 'NotFoundError';
}
