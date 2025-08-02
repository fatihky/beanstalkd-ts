import { BeanstalkdResponse } from './beanstalkd-response';
import { parseConstantResponse } from './utils/parse-constant-response';

const expected = Buffer.from('UNKNOWN_COMMAND\r\n');

export class UnknownCommandResponse extends BeanstalkdResponse {
  static readonly prefix = expected;

  static parse(buf: Buffer) {
    return parseConstantResponse(UnknownCommandResponse, buf, expected);
  }
}
