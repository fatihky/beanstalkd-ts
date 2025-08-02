import { BeanstalkdProtocolError } from '../beanstalkd-protocol-error';
import { bufStartsWith } from '../utils';
import { BeanstalkdResponse } from './beanstalkd-response';

export class ConstantResponse extends BeanstalkdResponse {
  constructor(readonly data: Buffer) {
    super();
  }

  static parse(
    buf: Buffer,
    expectedData: Buffer,
  ): ConstantResponse | [ConstantResponse, Buffer] | null {
    if (buf.byteLength < expectedData.length) return null; // read more data

    if (buf.byteLength === expectedData.byteLength) {
      if (buf.compare(expectedData) !== 0)
        throw new BeanstalkdProtocolError('Got invalid response.');

      return new ConstantResponse(expectedData);
    }

    // buf.byteLength > expectedData.byteLength
    if (!bufStartsWith(buf, expectedData))
      throw new BeanstalkdProtocolError(
        `Got invalid response. Expected: ${JSON.stringify(expectedData.toString())}`,
      );

    const remaining = buf.subarray(expectedData.byteLength);

    return [new ConstantResponse(expectedData), remaining];
  }
}
