import { BeanstalkdError } from './beanstalkd-error';

export class JobBuriedError extends BeanstalkdError {
  override name = 'JobBuriedError';

  constructor(
    readonly jobId: number,
    message?: string,
  ) {
    super(new Error(message));
  }
}
