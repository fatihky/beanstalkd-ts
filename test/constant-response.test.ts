import { describe, expect, it } from 'vitest';
import { ConstantResponse } from '../src/responses/utils/constant-response';
import assert from 'node:assert';
import { BeanstalkdProtocolError } from '../src/beanstalkd-protocol-error';

describe('constant response', () => {
  const someResponse = Buffer.from('SOME_RESPONSE\r\n');

  it('should parse constant response', () => {
    const input = Buffer.from('SOME_RESPONSE\r\n');
    const result = ConstantResponse.parse(input, someResponse);

    expect(result).toBeInstanceOf(ConstantResponse);
  });

  it('should parse partial streams', () => {
    const input1 = Buffer.from('SOME');
    const input2 = Buffer.from('_RESPONSE\r\nSOME_');
    const input3 = Buffer.from('RESPONSE\r\n');

    let buf: Buffer<ArrayBufferLike> = input1;

    expect(ConstantResponse.parse(buf, someResponse)).toBeNull();

    buf = Buffer.concat([buf, input2]);

    // first command must be parsed and remaining bytes must be returned
    const result = ConstantResponse.parse(buf, someResponse);

    expect(result).toBeInstanceOf(Array); // tuple must be returned
    assert(Array.isArray(result));

    const [, remaining] = result;

    buf = remaining;

    // the second command still not complete, so null gets returned
    expect(ConstantResponse.parse(buf, someResponse)).toBeNull();

    buf = Buffer.concat([buf, input3]);

    const result2 = ConstantResponse.parse(buf, someResponse);

    expect(result2).toBeInstanceOf(ConstantResponse);
  });

  it('should parse constant response and return remaining bytes', () => {
    const input = Buffer.from('SOME_RESPONSE\r\nextra');
    const result = ConstantResponse.parse(input, someResponse);

    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(2);

    assert(Array.isArray(result));

    expect(result[1].toString()).toBe('extra');
  });

  it('should throw protocol error if got invalid input', () => {
    const input = Buffer.from('invalid input'.repeat(3));

    expect(() => ConstantResponse.parse(input, someResponse)).toThrowError(
      BeanstalkdProtocolError,
    );
  });
});
