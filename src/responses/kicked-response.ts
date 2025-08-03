import { BeanstalkdResponse } from './beanstalkd-response';
import { handleParseResponseWithInt } from './utils/parse-response-with-int';

const prefix = Buffer.from('KICKED ');

export class KickedResponse extends BeanstalkdResponse {
  // see: https://github.com/beanstalkd/beanstalkd/blob/master/prot.c#L1627
  static prefix = prefix;

  constructor(readonly jobCount: number) {
    super();
  }

  static parse(buf: Buffer): KickedResponse | [KickedResponse, Buffer] | null {
    return handleParseResponseWithInt(KickedResponse, buf, prefix);
  }
}
