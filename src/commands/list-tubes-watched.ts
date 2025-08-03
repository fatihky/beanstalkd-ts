import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import { type BeanstalkdResponse, OkResponse } from '../responses';
import { BeanstalkdCommand } from './command';
import { ListTubesCommand } from './list-tubes';

const cmd = Buffer.from('list-tubes-watched\r\n');

export class ListTubesWatchedCommand extends BeanstalkdCommand<string[], void> {
  override compose(): Buffer {
    return cmd;
  }

  override handle(response: BeanstalkdResponse): string[] {
    if (!(response instanceof OkResponse))
      throw new BeanstalkdInvalidResponseError(
        'list-tubes-watched command expects "ok" response',
      );

    return ListTubesCommand.parse(response);
  }
}
