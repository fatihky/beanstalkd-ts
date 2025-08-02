import { BeanstalkdResponse } from './beanstalkd-response';
import { parseConstantResponse } from './utils/parse-constant-response';

const expected = Buffer.from('BAD_FORMAT\r\n');

export class BadFormatResponse extends BeanstalkdResponse {
  static readonly prefix = expected;

  static parse(buf: Buffer) {
    return parseConstantResponse(BadFormatResponse, buf, expected);
  }
}
