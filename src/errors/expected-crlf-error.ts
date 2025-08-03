import { BeanstalkdError } from './beanstalkd-error';

export class ExpectedCrlfError extends BeanstalkdError {
  override name = 'ExpectedCrlfError';
}
