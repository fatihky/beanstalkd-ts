import { BeanstalkdResponse } from './beanstalkd-response';
import { parseConstantResponse } from './utils/parse-constant-response';

const expected = Buffer.from('NOT_FOUND\r\n');

export class NotFoundResponse extends BeanstalkdResponse {
  static readonly prefix = expected;

  static parse(buf: Buffer) {
    return parseConstantResponse(NotFoundResponse, buf, expected);
  }
}
