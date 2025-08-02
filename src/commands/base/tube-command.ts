import { BeanstalkdCommand } from '../command';

/**
 * base class for commands that just accepts a tube name as the only argument
 */
export abstract class TubeCommand<T> extends BeanstalkdCommand<T, string> {
  constructor(private cmd: string) {
    super();
  }

  override compose(tube: string): Buffer {
    return Buffer.from(`${this.cmd} ${tube}\r\n`);
  }
}
