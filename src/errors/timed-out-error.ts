import { BeanstalkdError } from './beanstalkd-error';

/**
 * This is returned from the reserve-with-timeout command
 */
export class TimedOutError extends BeanstalkdError {
  override readonly name = 'TimedOutError';
}
