import { BeanstalkdResponse } from './beanstalkd-response';
import { handleParseResponseWithInt } from './utils/parse-response-with-int';

const prefix = Buffer.from('DELETED ');

/**
 * beanstalkd-pi extension: reply to the "delete-tube" command.
 *
 * Not to be confused with `DeletedResponse` ("DELETED\r\n", no count), which
 * is the reply to "delete". "delete-tube" replies with the number of jobs it
 * purged instead: "DELETED <count>\r\n".
 */
export class TubeDeletedResponse extends BeanstalkdResponse {
  static prefix = prefix;

  constructor(readonly jobCount: number) {
    super();
  }

  static parse(
    buf: Buffer,
  ): TubeDeletedResponse | [TubeDeletedResponse, Buffer] | null {
    return handleParseResponseWithInt(TubeDeletedResponse, buf, prefix);
  }
}
