import assert from 'node:assert';
import { describe, expect, it } from 'vitest';
import { BeanstalkdResponseParser } from '../../src/response-parser';
import { KickedResponse } from '../../src/responses';

describe('kicked response', () => {
  it('should parse kicked response', () => {
    const parser = new BeanstalkdResponseParser();
    const result = parser.read(Buffer.from('KICKED 1234\r\n'));

    expect(result).not.toBeNull();
    expect(result).toBeInstanceOf(KickedResponse);
    assert(result instanceof KickedResponse);
    expect(result.jobCount).toBe(1234);
  });
});
