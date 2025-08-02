import { BeanstalkdProtocolError } from '../beanstalkd-protocol-error';
import { crlf, ensureBufferMaxLengthWithoutHeader } from '../utils';
import { BeanstalkdResponse } from './beanstalkd-response';

const prefix = Buffer.from('RESERVED ');
const minByteLength =
  prefix.byteLength +
  // id
  1 +
  // byte count
  1 +
  // 1 byte data
  1 +
  crlf.byteLength * 2;

/**
 * Format:
 * "RESERVED <id> <bytes>\r\n<data>\r\n"
 */
export class ReservedResponse extends BeanstalkdResponse {
  static prefix = prefix;

  constructor(
    readonly jobId: number,
    readonly payload: Buffer,
  ) {
    super();
  }

  static parse(
    buf: Buffer,
  ): ReservedResponse | [ReservedResponse, Buffer] | null {
    if (buf.byteLength < minByteLength) return null;

    const crlfIndex = buf.indexOf(crlf);

    if (crlfIndex < 0) {
      ensureBufferMaxLengthWithoutHeader(buf);
      return null;
    }

    const [id, bytes] = buf
      .subarray(prefix.length, crlfIndex)
      .toString()
      .split(' ');

    if (!id || !bytes)
      throw new BeanstalkdProtocolError('Invalid "reserved" response header.');

    const jobId = Number(id);
    const byteCount = Number(bytes);

    if (Number.isNaN(jobId) || Number.isNaN(byteCount))
      throw new BeanstalkdProtocolError(
        'Invalid "reserved" response header: id or bytes was invalid.',
      );

    const expectedByteLength = crlfIndex + 2 + byteCount + crlf.byteLength;

    if (buf.byteLength < expectedByteLength) return null;

    const response = new ReservedResponse(
      jobId,
      buf.subarray(crlfIndex + 2, buf.byteLength - 2),
    );

    if (buf.length === expectedByteLength) {
      return response;
    }

    const remaining = buf.subarray(expectedByteLength);

    return [response, remaining];
  }
}
