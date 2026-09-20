import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import { type BeanstalkdResponse, OkResponse } from '../responses';
import { crlf } from '../utils';
import { BeanstalkdCommand } from './command';
import { ListTubesCommand } from './list-tubes';

const cmd = Buffer.concat([Buffer.from('list-tubes-paused'), crlf]);

/**
 * beanstalkd-pi extension: the names of every currently paused tube,
 * alphabetically sorted ("default" is not special-cased, unlike
 * "list-tubes"). Empty if no tube is currently paused.
 */
export class ListTubesPausedCommand extends BeanstalkdCommand<string[], void> {
  override compose(): Buffer {
    return cmd;
  }

  override handle(response: BeanstalkdResponse): string[] {
    if (!(response instanceof OkResponse))
      throw new BeanstalkdInvalidResponseError(
        'list-tubes-paused command expects "ok" response',
      );

    return ListTubesCommand.parse(response);
  }
}
