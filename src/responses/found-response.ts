import { BeanstalkdResponse } from './beanstalkd-response';
import { parseHeaderWithValues } from './utils/parse-header';
import { readPayload } from './utils/read-payload';

const prefix = Buffer.from('FOUND ');

export class FoundResponse extends BeanstalkdResponse {
  static prefix = prefix;

  constructor(
    readonly jobId: number,
    readonly payload: Buffer,
  ) {
    super();
  }

  /**
   * Response format:
   * "FOUND <id> <bytes>\r\n<data>\r\n"
   */
  static parse(buf: Buffer): FoundResponse | [FoundResponse, Buffer] | null {
    const header = parseHeaderWithValues(buf, prefix, { intCount: 2 });

    if (header === null) return null;

    const [jobId, bytes] = header;
    const payload = readPayload(buf, bytes);

    if (payload === null) return null;

    if (Array.isArray(payload))
      return [new FoundResponse(jobId, payload[0]), payload[1]];

    return new FoundResponse(jobId, payload);
  }
}
