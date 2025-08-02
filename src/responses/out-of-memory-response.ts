import { BeanstalkdResponse } from './beanstalkd-response';
import { parseConstantResponse } from './utils/parse-constant-response';

const expected = Buffer.from('OUT_OF_MEMORY\r\n');

export class OutOfMemoryResponse extends BeanstalkdResponse {
  static readonly prefix = expected;

  static parse(buf: Buffer) {
    return parseConstantResponse(OutOfMemoryResponse, buf, expected);
  }
}
