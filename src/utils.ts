import { BeanstalkdProtocolError } from './beanstalkd-protocol-error';
import { MAX_HEADER_LENGTH } from './constants';

export const crlf = Buffer.from('\r\n');
export const emptyBuf = Buffer.alloc(0);

export function bufStartsWith(buf: Buffer, prefix: Buffer): boolean {
  return buf.subarray(0, prefix.length).compare(prefix) === 0;
}

export function bufEndsWith(buf: Buffer, suffix: Buffer): boolean {
  return (
    buf.compare(
      suffix,
      0, // target start
      suffix.length, // target end
      Math.max(0, buf.byteLength - suffix.byteLength), // source start
    ) === 0
  );
}

/**
 * when the buffer does not contain a crlf,
 * throw an error to prevent exhaustive memory usage
 */
export function ensureBufferMaxLengthWithoutHeader(buf: Buffer) {
  if (buf.byteLength > MAX_HEADER_LENGTH)
    throw new BeanstalkdProtocolError(
      `Buffer exceeded maximum allowed header length: ${MAX_HEADER_LENGTH} bytes.`,
    );
}
