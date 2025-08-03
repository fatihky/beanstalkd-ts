import { BeanstalkdError } from './beanstalkd-error';

export class BadFormatError extends BeanstalkdError {
  override name = 'BadFormatError';
}
