import { describe, expect, it } from 'vitest';
import { BeanstalkdResponseParser } from '../../src/response-parser';
import { PausedResponse } from '../../src/responses';

describe('paused response', () => {
  it('should parse paused response', () => {
    const parser = new BeanstalkdResponseParser();
    const result = parser.read(Buffer.from('PAUSED\r\n'));

    expect(result).not.toBeNull();
    expect(result).toBeInstanceOf(PausedResponse);
  });
});
