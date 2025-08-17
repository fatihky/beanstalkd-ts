import { BeanstalkdProtocolError } from '../beanstalkd-protocol-error';
import { BeanstalkdResponse } from './beanstalkd-response';
import { parseHeaderWithValues } from './utils/parse-header';
import { readPayload } from './utils/read-payload';

const okPrefix = Buffer.from('OK ');

/**
 * Here is the protocol specification for the OK response.
 * Used for many commands.
 * "OK <bytes>\r\n<data>\r\n"
 */
export class OkResponse extends BeanstalkdResponse {
  static readonly prefix = okPrefix;

  constructor(readonly data: Buffer) {
    super();
  }

  static parse(buf: Buffer): OkResponse | [OkResponse, Buffer] | null {
    const header = parseHeaderWithValues(buf, okPrefix, { intCount: 1 });

    if (header === null) return null;

    const [bytes] = header;

    if (bytes < 0)
      throw new BeanstalkdProtocolError(
        'Got invalid OK response payload length',
      );

    const payload = readPayload(buf, bytes);

    if (payload === null) return null;

    if (Array.isArray(payload)) return [new OkResponse(payload[0]), payload[1]];

    return new OkResponse(payload);
  }
}
