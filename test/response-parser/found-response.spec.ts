import { describe, expect, it } from 'vitest';
import { BeanstalkdResponseParser } from '../../src/response-parser';
import { FoundResponse } from '../../src/responses';
import assert from 'node:assert';

describe('found response', () => {
  it('should parse found response', () => {
    const parser = new BeanstalkdResponseParser();
    const result = parser.read(
      Buffer.from('FOUND 123 13\r\nbeanstalkd-ts\r\n'),
    );

    expect(result).toBeInstanceOf(FoundResponse);
    assert(result instanceof FoundResponse);
    expect(result.jobId).toBe(123);
    expect(result.payload.toString()).toBe('beanstalkd-ts');
  });

  it('should parse partial found response', () => {
    const parser = new BeanstalkdResponseParser();

    expect(parser.read(Buffer.from('FOUND 123 13'))).toBeNull();

    const result = parser.read(Buffer.from('\r\nbeanstalkd-ts\r\n'));

    expect(result).toBeInstanceOf(FoundResponse);
  });
});
