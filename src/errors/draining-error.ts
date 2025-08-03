import { BeanstalkdError } from './beanstalkd-error';

export class DrainingError extends BeanstalkdError {
  override name = 'DrainingError';
}
