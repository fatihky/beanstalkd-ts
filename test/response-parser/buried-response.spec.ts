import assert from 'node:assert';
import { describe, expect, it } from 'vitest';
import { BeanstalkdResponseParser } from '../../src/response-parser';
import { BuriedResponse } from '../../src/responses/buried-response';

describe('buried response', () => {
  it('should parse buried response', () => {
    const parser = new BeanstalkdResponseParser();
    const result = parser.read(Buffer.from('BURIED 1234\r\n'));

    expect(result).not.toBeNull();
    expect(result).toBeInstanceOf(BuriedResponse);
    assert(result instanceof BuriedResponse);
    expect(result.jobId).toBe(1234);
  });
});
