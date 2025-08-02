import { BeanstalkdResponse } from './beanstalkd-response';
import { parseConstantResponse } from './utils/parse-constant-response';

const expected = Buffer.from('TIMED_OUT\r\n');

export class TimedOutResponse extends BeanstalkdResponse {
  static readonly prefix = expected;

  static parse(buf: Buffer) {
    return parseConstantResponse(TimedOutResponse, buf, expected);
  }
}
