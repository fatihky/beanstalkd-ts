import { BeanstalkdResponse } from './beanstalkd-response';
import { handleParseResponseWithId } from './utils/parse-response-with-id';

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
    return handleParseResponseWithId(JobBuriedResponse, input, prefix);
  }
}
