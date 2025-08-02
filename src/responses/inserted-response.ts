import { BeanstalkdResponse } from './beanstalkd-response';
import { parseResponseWithId } from './parse-response-with-id';

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
    const result = parseResponseWithId(input, prefix);

    if (result === null) return null;

    if (typeof result === 'number') return new InsertedResponse(result);

    return [new InsertedResponse(result[0]), result[1]];
  }
}
