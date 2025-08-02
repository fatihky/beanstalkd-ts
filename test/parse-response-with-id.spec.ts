import assert from 'node:assert';
import { describe, expect, it } from 'vitest';
import { BeanstalkdProtocolError } from '../src/beanstalkd-protocol-error';
import { parseResponseWithInt } from '../src/responses/utils/parse-response-with-int';

describe('parse responses with id', () => {
  const prefix = Buffer.from('PREFIX ');

  it('should parse complete response', () => {
    const input = Buffer.from('PREFIX 12345\r\n');
    const result = parseResponseWithInt(input, prefix);

    expect(result).toBe(12345);
  });

  it('should return extra input along with id', () => {
    const input = Buffer.from('PREFIX 12345\r\nextra');
    const result = parseResponseWithInt(input, prefix);

    expect(result).toBeInstanceOf(Array);
    assert(Array.isArray(result));

    expect(result[0]).toBe(12345);
    expect(result[1]).toBeInstanceOf(Buffer);
    expect(result[1].compare(Buffer.from('extra'))).toBe(0);
  });

  it('should parse partial response', () => {
    const input1 = Buffer.from('PREFIX ');
    const input2 = Buffer.from('12345\r\n');

    expect(parseResponseWithInt(input1, prefix)).toBeNull();

    expect(parseResponseWithInt(Buffer.concat([input1, input2]), prefix)).toBe(
      12345,
    );
  });

  it('should throw protocol error if got invalid input', () => {
    expect(() =>
      parseResponseWithInt(Buffer.from('totally invalid input'), prefix),
    ).toThrowError(BeanstalkdProtocolError);

    expect(() =>
      // does not end with \r\n
      parseResponseWithInt(Buffer.from('PREFIX 1234\r\r'), prefix),
    ).toThrowError(BeanstalkdProtocolError);
  });

  it('should throw protocol error if got invalid id', () => {
    const input = Buffer.from('PREFIX invalid\r\n');

    expect(() => parseResponseWithInt(input, prefix)).toThrowError(
      BeanstalkdProtocolError,
    );
  });
});
