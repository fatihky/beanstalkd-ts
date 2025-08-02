import type { BeanstalkdResponse } from '../response';

export abstract class BeanstalkdCommand<T, A> {
  abstract compose(arg: A): Buffer;

  abstract handle(response: BeanstalkdResponse): T;
}
