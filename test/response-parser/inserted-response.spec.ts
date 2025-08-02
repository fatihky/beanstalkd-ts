import assert from 'node:assert';
import { describe, expect, it } from 'vitest';
import { BeanstalkdResponseParser } from '../../src/response-parser';
import { InsertedResponse } from '../../src/responses';

describe('inserted response', () => {
  it('should parse inserted response', () => {
    const parser = new BeanstalkdResponseParser();
    const result = parser.read(Buffer.from('INSERTED 1234\r\n'));

    expect(result).not.toBeNull();
    expect(result).toBeInstanceOf(InsertedResponse);
    assert(result instanceof InsertedResponse);
    expect(result.jobId).toBe(1234);
  });
});
