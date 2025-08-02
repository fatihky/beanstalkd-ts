import { BeanstalkdResponse } from './beanstalkd-response';
import { parseConstantResponse } from './utils/parse-constant-response';

const expected = Buffer.from('EXPECTED_CRLF\r\n');

export class ExpectedCrlfResponse extends BeanstalkdResponse {
  static readonly prefix = expected;

  static parse(buf: Buffer) {
    return parseConstantResponse(ExpectedCrlfResponse, buf, expected);
  }
}
