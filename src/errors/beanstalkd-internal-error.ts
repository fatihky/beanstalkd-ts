import { BeanstalkdError } from './beanstalkd-error';

export class BeanstalkdInternalError extends BeanstalkdError {
  override name = 'BeanstalkdInternalError';
}
