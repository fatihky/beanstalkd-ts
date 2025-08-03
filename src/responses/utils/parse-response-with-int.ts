import { BeanstalkdProtocolError } from '../../beanstalkd-protocol-error';
import {
  bufStartsWith,
  crlf,
  ensureBufferMaxLengthWithoutHeader,
} from '../../utils';

export function parseResponseWithInt(
  buf: Buffer,
  prefix: Buffer,
): // int
  | number
  // [int, remaining bytes]
  | [number, Buffer]
  // should read more data
  | null {
  const expectedMinimumByteLength = prefix.byteLength + 1 + crlf.byteLength;

  if (buf.byteLength < expectedMinimumByteLength) return null; // read more data

  if (!bufStartsWith(buf, prefix))
    throw new BeanstalkdProtocolError('Invalid prefix');

  const crlfIndex = buf.indexOf(crlf);

  if (crlfIndex < 0) {
    // crlf was not found but do not allow headers to exceed the maximum allowed size
    ensureBufferMaxLengthWithoutHeader(buf);

    return null; // read more data
  }

  const intBytes = buf.toString('ascii', prefix.length, crlfIndex);
  const int = Number(intBytes);

  if (Number.isNaN(int))
    throw new BeanstalkdProtocolError(
      `Got invalid job int: ${JSON.stringify(intBytes.toString())}`,
    );

  // return only the int value if no more data
  if (buf.length === crlfIndex + crlf.byteLength) return int;

  return [int, buf.subarray(crlfIndex + crlf.byteLength)];
}

/**
 * Parse beanstalkd responses with a single integer value
 *
 * @returns {T | [T, Buffer] | null}
 * T => buffer contains the full response and includes no extra bytes. so you are free to discard buf
 * [T, Buffer] => buffer contains response and some extra bytes. you must parse remaining bytes again.
 * null => more data must be read
 *
 * Example responses are:
 * - "INSERTED <id>\r\n"
 * - "KICKED <count>\r\n"
 */
export function handleParseResponseWithInt<T>(
  cons: new (int: number) => T,
  buf: Buffer,
  prefix: Buffer,
): T | [T, Buffer] | null {
  const result = parseResponseWithInt(buf, prefix);

  if (result === null) return null;

  if (typeof result === 'number') return new cons(result);

  return [new cons(result[0]), result[1]];
}
