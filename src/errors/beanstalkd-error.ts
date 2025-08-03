/**
 * Custom base class for the errors returned from beanstalkd.
 *
 * We chose this method because `instanceof ...` checks fails.
 *
 * See this stackoverflow question for more information: https://stackoverflow.com/a/43913220
 */
export abstract class BeanstalkdError {
  abstract name: string;
  readonly message: string;
  stack?: string;

  constructor(readonly originalError?: Error) {
    this.message = originalError?.message ?? 'BeanstalkdError';
    this.stack = new Error('BeanstalkdError').stack;
  }
}
