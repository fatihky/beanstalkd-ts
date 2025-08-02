import { BeanstalkdProtocolError } from '../../beanstalkd-protocol-error';
import { bufStartsWith, crlf } from '../../utils';

export function parseResponseWithId(
  input: Buffer,
  prefix: Buffer,
): // id
  | number
  // [id, remaining bytes]
  | [number, Buffer]
  // should read more data
  | null {
  const expectedMinimumByteLength = prefix.byteLength + 1 + crlf.byteLength;

  if (input.byteLength < expectedMinimumByteLength) return null; // read more data

  if (!bufStartsWith(input, prefix))
    throw new BeanstalkdProtocolError('Invalid prefix');

  const crlfIndex = input.indexOf(crlf);

  if (crlfIndex < 0) throw new BeanstalkdProtocolError('No crlf found');

  const idBytes = input.toString('ascii', prefix.length, crlfIndex);
  const id = Number(idBytes);

  if (Number.isNaN(id))
    throw new BeanstalkdProtocolError(
      `Got invalid job id: ${JSON.stringify(idBytes.toString())}`,
    );

  // return only the job id if no more data
  if (input.length === crlfIndex + crlf.byteLength) return id;

  return [id, input.subarray(crlfIndex + crlf.byteLength)];
}

export function handleParseResponseWithId<T>(
  cons: new (jobId: number) => T,
  buf: Buffer,
  prefix: Buffer,
): T | [T, Buffer] | null {
  const result = parseResponseWithId(buf, prefix);

  if (result === null) return null;

  if (typeof result === 'number') return new cons(result);

  return [new cons(result[0]), result[1]];
}
