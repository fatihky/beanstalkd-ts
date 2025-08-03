import assert from 'node:assert';
import { describe, expect, it } from 'vitest';
import { BeanstalkdProtocolError } from '../../../src/beanstalkd-protocol-error';
import { readPayload } from '../../../src/responses/utils/read-payload';

describe('read paylaod from beanstalkd response', () => {
  it('should read and extract payload', () => {
    const result = readPayload(
      Buffer.from('RESULT 1 2 3\r\nbeanstalkd-ts\r\n'),
      13,
    );

    expect(result).toBeInstanceOf(Buffer);
    assert(result instanceof Buffer);
    expect(result.toString()).toBe('beanstalkd-ts');
  });

  it('should return null if the buffer is not complete', () => {
    expect(readPayload(Buffer.from('RESULT 1 2 3\r\n'), 13)).toBeNull();
  });

  it('should throw error if the paylaod was not terminated with crlf', () => {
    expect(() =>
      readPayload(
        Buffer.from('RESULT 1 2 3\r\nbeanstalkd-ts_invalid_crlf_'),
        13,
      ),
    ).toThrowError(BeanstalkdProtocolError);
  });
});
