import { BeanstalkdError } from './beanstalkd-error';

export class UnkownCommandError extends BeanstalkdError {
  override name = 'UnkownCommandError';
}
