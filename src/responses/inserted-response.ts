import { BeanstalkdResponse } from './beanstalkd-response';
import { handleParseResponseWithId } from './utils/parse-response-with-id';

const prefix = Buffer.from('INSERTED ');

export class InsertedResponse extends BeanstalkdResponse {
  // see: https://github.com/beanstalkd/beanstalkd/blob/master/prot.c#L91
  static prefix = prefix;

  constructor(readonly jobId: number) {
    super();
  }

  static parse(input: Buffer): // got a full inserted response
    | InsertedResponse
    // got a inserted response and some extra bytes
    | [InsertedResponse, Buffer]
    // more data must be received
    | null {
    return handleParseResponseWithId(InsertedResponse, input, prefix);
  }
}
