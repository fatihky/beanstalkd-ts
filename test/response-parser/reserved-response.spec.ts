import assert from 'node:assert';
import { describe, expect, it } from 'vitest';
import { BeanstalkdResponseParser } from '../../src/response-parser';
import { ReservedResponse } from '../../src/responses';

describe('reserved response', () => {
  it('should parse reserved resonse', () => {
    const parser = new BeanstalkdResponseParser();
    const input = Buffer.from('RESERVED 1 12\r\nbeanstalkd-ts\r\n');
    const result = parser.read(input);

    expect(result).not.toBeNull();
    expect(result).toBeInstanceOf(ReservedResponse);
    assert(result instanceof ReservedResponse);
    expect(result.jobId).toBe(1);
    expect(result.payload.toString()).toBe('beanstalkd-ts');
  });

  it('should parse partial response', () => {
    const parser = new BeanstalkdResponseParser();

    expect(parser.read(Buffer.from('RESERVED 1 12\r\n'))).toBeNull();

    const result = parser.read(Buffer.from('beanstalkd-ts\r\n'));

    expect(result).not.toBeNull();
    expect(result).toBeInstanceOf(ReservedResponse);
    assert(result instanceof ReservedResponse);
  });

  it('should throw error if invalid id or bytes data provided', () => {
    const parser = () => new BeanstalkdResponseParser();

    expect(() => parser().read(Buffer.from('RESERVED invalid number\r\n')));
    expect(() =>
      parser().read(Buffer.from('RESERVED 1 2\r\nmore than indicated')),
    );
    expect(() => parser().read(Buffer.from('RESERVED 1 2\r\n')));
    expect(() => parser().read(Buffer.from('RESERVED invalid number\r\n')));
  });
});
