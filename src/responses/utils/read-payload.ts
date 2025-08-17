import { BeanstalkdProtocolError } from '../../beanstalkd-protocol-error';
import { crlf } from '../../utils';

/**
 * Read payload from beanstalkd response.
 * This utility function ensures that we have fully received the payload and
 * the payload is terminated with a crlf. Otherwise it throws error.
 *
 * @argument buf {Buffer} beanstalkd response INCLUDING header.
 * @argument byteCount {number} expected payload size. You might extract
 * this value with `parseHeaderWithValues`.
 *
 * Responses with payloads are formatted like this:
 * - "OK <bytes>\r\n<data>\r\n"
 * - "FOUND <id> <bytes>\r\n<data>\r\n"
 */
export function readPayload(
  buf: Buffer,
  byteCount: number,
): Buffer | [Buffer, Buffer] | null {
  const headerCrlfIndex = buf.indexOf(crlf);

  // header not received yet. please parse header with `parseHeaderWithValues` first.
  if (headerCrlfIndex < 0) return null;

  const payloadOffset = headerCrlfIndex + crlf.byteLength;
  const expectedByteLength = payloadOffset + byteCount + crlf.byteLength;

  if (buf.byteLength < expectedByteLength) return null; // wait for body and crlf tag to be received

  const payloadTerminatedWithCrlf =
    buf.compare(
      crlf,
      0,
      crlf.byteLength,
      payloadOffset + byteCount, // look right after the payload
      payloadOffset + byteCount + crlf.byteLength,
    ) === 0;

  if (!payloadTerminatedWithCrlf)
    throw new BeanstalkdProtocolError(
      'Response payload not terminated with crlf',
    );

  if (expectedByteLength === buf.byteLength)
    return buf.subarray(payloadOffset, payloadOffset + byteCount);

  return [
    buf.subarray(payloadOffset, payloadOffset + byteCount), // payload
    buf.subarray(expectedByteLength), // remaining bytes
  ];
}
