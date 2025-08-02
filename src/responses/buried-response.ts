import { BeanstalkdResponse } from './beanstalkd-response';
import { handleParseResponseWithId } from './utils/parse-response-with-id';

const prefix = Buffer.from('BURIED ');

export class BuriedResponse extends BeanstalkdResponse {
  // see: https://github.com/beanstalkd/beanstalkd/blob/master/prot.c#L90
  static prefix = prefix;

  constructor(readonly jobId: number) {
    super();
  }

  static parse(input: Buffer) {
    return handleParseResponseWithId(BuriedResponse, input, prefix);
  }
}
