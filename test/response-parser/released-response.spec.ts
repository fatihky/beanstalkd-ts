import { describe, expect, it } from 'vitest';
import { BeanstalkdResponseParser } from '../../src/response-parser';
import { ReleasedResponse } from '../../src/responses';

describe('released response', () => {
  it('should parse released response', () => {
    const parser = new BeanstalkdResponseParser();
    const result = parser.read(Buffer.from('RELEASED\r\n'));

    expect(result).not.toBeNull();
    expect(result).toBeInstanceOf(ReleasedResponse);
  });
});
