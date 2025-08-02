import assert from 'node:assert';
import { describe, expect, it } from 'vitest';
import { BeanstalkdResponseParser } from '../../src/response-parser';
import { JobTooBigResponse } from '../../src/responses';

describe('job too big response', () => {
  it('should parse job too big response', () => {
    const parser = new BeanstalkdResponseParser();
    const result = parser.read(Buffer.from('JOB_TOO_BIG\r\n'));

    expect(result).not.toBeNull();
    expect(result).toBeInstanceOf(JobTooBigResponse);
    assert(result instanceof JobTooBigResponse);
  });
});
