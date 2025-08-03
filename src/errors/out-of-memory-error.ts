import { BeanstalkdError } from './beanstalkd-error';

export class OutOfMemoryError extends BeanstalkdError {
  override name = 'OutOfMemoryError';
}
