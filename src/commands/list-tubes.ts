import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import { type BeanstalkdResponse, OkResponse } from '../responses';
import { BeanstalkdCommand } from './command';

const cmd = Buffer.from('list-tubes\r\n');

/**
 * List Tubes command returns all the tubes in beanstalkd server.
 *
 * Example response:
 *
 * OK 20\r\n
 * ---\r\n
 * - default\r\n
 * - foo\r\n
 */
export class ListTubesCommand extends BeanstalkdCommand<string[], void> {
  override compose(): Buffer {
    return cmd;
  }

  override handle(response: BeanstalkdResponse): string[] {
    if (!(response instanceof OkResponse))
      throw new BeanstalkdInvalidResponseError(
        'list-tubes command expects "ok" response',
      );

    return ListTubesCommand.parse(response);
  }

  static parse(response: OkResponse): string[] {
    return (
      response.data
        .toString('ascii') // paylaod must be ascii encoded
        .slice(4) // cut the header line "---\n"
        .trim() // trim empty ending line
        .split('\n')
        // tube names start with "- "
        // let's just slice the tube name strings
        .map((line) => line.slice(2))
    );
  }
}
