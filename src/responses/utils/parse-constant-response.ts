import { BeanstalkdProtocolError } from '../../beanstalkd-protocol-error';
import { bufStartsWith } from '../../utils';

/**
 * Parse response with a constant content.
 * You MUST include crlf at the end of your expected value.
 */
export function parseConstantResponse<T>(
  cons: new () => T,
  buf: Buffer,
  expected: Buffer,
): T | [T, Buffer] | null {
  if (buf.byteLength < expected.length) return null; // read more data

  if (buf.byteLength === expected.byteLength) {
    if (buf.compare(expected) !== 0)
      throw new BeanstalkdProtocolError('Got invalid response.');

    return new cons();
  }

  // buf.byteLength > expectedData.byteLength
  if (!bufStartsWith(buf, expected))
    throw new BeanstalkdProtocolError(
      `Got invalid response. Expected: ${JSON.stringify(expected.toString())}`,
    );

  const remaining = buf.subarray(expected.byteLength);

  return [new cons(), remaining];
}
