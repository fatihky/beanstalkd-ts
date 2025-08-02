import { BeanstalkdProtocolError } from '../../beanstalkd-protocol-error';
import { bufStartsWith, crlf } from '../../utils';

export function parseResponseWithInt(
  input: Buffer,
  prefix: Buffer,
): // int
  | number
  // [int, remaining bytes]
  | [number, Buffer]
  // should read more data
  | null {
  const expectedMinimumByteLength = prefix.byteLength + 1 + crlf.byteLength;

  if (input.byteLength < expectedMinimumByteLength) return null; // read more data

  if (!bufStartsWith(input, prefix))
    throw new BeanstalkdProtocolError('Invalid prefix');

  const crlfIndex = input.indexOf(crlf);

  if (crlfIndex < 0) throw new BeanstalkdProtocolError('No crlf found');

  const intBytes = input.toString('ascii', prefix.length, crlfIndex);
  const int = Number(intBytes);

  if (Number.isNaN(int))
    throw new BeanstalkdProtocolError(
      `Got invalid job int: ${JSON.stringify(intBytes.toString())}`,
    );

  // return only the int value if no more data
  if (input.length === crlfIndex + crlf.byteLength) return int;

  return [int, input.subarray(crlfIndex + crlf.byteLength)];
}

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
