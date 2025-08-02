import { BeanstalkdResponse } from './beanstalkd-response';
import { handleParseResponseWithInt } from './utils/parse-response-with-int';

const prefix = Buffer.from('WATCHING ');

export class WatchingResponse extends BeanstalkdResponse {
  // see:
  // https://github.com/beanstalkd/beanstalkd/blob/master/prot.c#L1788
  // https://github.com/beanstalkd/beanstalkd/blob/master/prot.c#L1808
  static prefix = prefix;

  constructor(readonly watchingTubes: number) {
    super();
  }

  static parse(buf: Buffer) {
    return handleParseResponseWithInt(WatchingResponse, buf, prefix);
  }
}
