import { describe, expect, it } from 'vitest';
import { BeanstalkdResponseParser } from '../../src/response-parser';
import { JobKickedResponse } from '../../src/responses';

describe('job kicked response', () => {
  it('should parse job kicked response', () => {
    const parser = new BeanstalkdResponseParser();
    const result = parser.read(Buffer.from('KICKED\r\n'));

    expect(result).not.toBeNull();
    expect(result).toBeInstanceOf(JobKickedResponse);
  });
});
