import { BeanstalkdProtocolError } from '../beanstalkd-protocol-error';
import { bufEndsWith, crlf } from '../utils';
import { BeanstalkdResponse } from './beanstalkd-response';

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
    const crlfIndex = buf.indexOf(crlf);

    if (crlfIndex === -1) return null;

    const bytes = buf.toString('ascii', okPrefix.length, crlfIndex);
    const bytesNum = Number(bytes);

    if (Number.isNaN(bytesNum) || !Number.isInteger(bytesNum) || bytesNum < 0)
      throw new BeanstalkdProtocolError('Invalid bytes');

    // ensure buf contains all the necessary bytes
    const headerLength =
      // length of "OK <bytes>\r\n"
      okPrefix.byteLength + bytes.length + crlf.byteLength;
    const expectedByteLength =
      headerLength +
      // length of "<data>\r\n"
      bytesNum +
      crlf.length;

    if (buf.byteLength < expectedByteLength) return null; // wait for more data

    // ensure buf ends with crlf
    const dataBuf = buf.subarray(
      headerLength,
      headerLength + bytesNum + crlf.byteLength + 1,
    );

    if (!bufEndsWith(dataBuf, crlf)) {
      throw new BeanstalkdProtocolError('Data does not end with \\r\\n');
    }

    const data = dataBuf.subarray(0, dataBuf.byteLength - crlf.byteLength);

    if (buf.byteLength > expectedByteLength) {
      const remaining = buf.subarray(expectedByteLength + 1);

      return [new OkResponse(data), remaining];
    }

    return new OkResponse(data);
  }
}
