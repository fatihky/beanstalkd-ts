import { BeanstalkdProtocolError } from '../../beanstalkd-protocol-error';
import {
  bufStartsWith,
  crlf,
  ensureBufferMaxLengthWithoutHeader,
} from '../../utils';

/**
 * Beanstalkd response headers are ascii-encoded and human-readable.
 * If any values returned along with an header, they will be
 * delimited by space.
 *
 * @returns {true | [true, Buffer] | null}
 * null => more data needed to be read
 * true => header parsed successfully. no values parsed.
 *
 * Example beanstalkd responses (header and payload):
 * - "BURIED <id>\r\n"
 * - "FOUND <id> <bytes>\r\n<data>\r\n"
 * - "INSERTED <id>\r\n"
 * - "KICKED <count>\r\n"
 * - "OK <bytes>\r\n<data>\r\n"
 * - "USING <tube>\r\n"
 */
export function parseHeaderWithValues(
  buf: Buffer,
  prefix: Buffer,
  valSpec: null,
): true | null;
export function parseHeaderWithValues(
  buf: Buffer,
  prefix: Buffer,
  valSpec: { strCount: number },
): string[] | null;
export function parseHeaderWithValues(
  buf: Buffer,
  prefix: Buffer,
  valSpec: { intCount: number },
): number[] | null;
export function parseHeaderWithValues(
  /** the buffer received from the client */
  buf: Buffer,
  /** header prefix (without crlf) */
  prefix: Buffer,
  /**
   * values specification.
   * null: we expect no values
   * { strCount: number }: we expect n string values
   * { intCount: number }: we expect n integer values
   */
  valSpec: { strCount: number } | { intCount: number } | null,
): true | string[] | number[] | null {
  const minByteLength = prefix.byteLength + crlf.byteLength;

  if (buf.byteLength < minByteLength) return null; // wait for more data

  const crlfIndex = buf.indexOf(crlf);

  if (crlfIndex < 0) {
    // crlf was not found but do not allow headers to exceed the maximum allowed size
    ensureBufferMaxLengthWithoutHeader(buf);

    return null; // header not yet complete
  }

  if (!bufStartsWith(buf, prefix))
    throw new BeanstalkdProtocolError(
      `Expected prefix was not found: "${prefix.toString().trim()}"`,
    );

  if (valSpec === null) return true; // header parsed and no values are extracted

  const values = buf
    .subarray(prefix.byteLength, crlfIndex)
    .toString()
    .split(' ')
    .filter((s) => s !== '');

  if ('strCount' in valSpec) {
    const expectedVals = valSpec.strCount;
    const suffix = expectedVals > 1 ? 's' : '';

    if (values.length !== expectedVals)
      throw new BeanstalkdProtocolError(
        `Expected ${expectedVals} string value${suffix} but found ${values.length}. Prefix: ${prefix.toString()}. Values: ${JSON.stringify(values)}`,
      );

    return values;
  }

  const expectedVals = valSpec.intCount;
  const suffix = expectedVals > 1 ? 's' : '';

  if (values.length !== expectedVals)
    throw new BeanstalkdProtocolError(
      `Expected ${expectedVals} integer value${suffix} but found ${values.length}. Prefix: ${prefix.toString()}`,
    );

  const intValues = values.map((val, i) => {
    const intValue = Number(val);

    if (Number.isNaN(intValue) || !Number.isInteger(intValue)) {
      throw new BeanstalkdProtocolError(
        `Expected an integer value in index ${i}. Got: ${JSON.stringify(val)}. Response prefix: ${prefix.toString()}`,
      );
    }

    return intValue;
  });

  return intValues;
}
