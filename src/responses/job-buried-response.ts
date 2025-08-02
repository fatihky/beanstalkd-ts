import { BeanstalkdResponse } from './beanstalkd-response';
import { handleParseResponseWithInt } from './utils/parse-response-with-int';

const prefix = Buffer.from('BURIED ');

/**
 * Buried response with job id
 */
export class JobBuriedResponse extends BeanstalkdResponse {
  // see: https://github.com/beanstalkd/beanstalkd/blob/master/prot.c#L90
  static prefix = prefix;

  constructor(readonly jobId: number) {
    super();
  }

  static parse(input: Buffer) {
    return handleParseResponseWithInt(JobBuriedResponse, input, prefix);
  }
}
