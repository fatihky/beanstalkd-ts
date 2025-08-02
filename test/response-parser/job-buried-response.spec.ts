import assert from 'node:assert';
import { describe, expect, it } from 'vitest';
import { BeanstalkdResponseParser } from '../../src/response-parser';
import { JobBuriedResponse } from '../../src/responses';

describe('buried response', () => {
  it('should parse buried response', () => {
    const parser = new BeanstalkdResponseParser();
    const result = parser.read(Buffer.from('BURIED 1234\r\n'));

    expect(result).not.toBeNull();
    expect(result).toBeInstanceOf(JobBuriedResponse);
    assert(result instanceof JobBuriedResponse);
    expect(result.jobId).toBe(1234);
  });
});
