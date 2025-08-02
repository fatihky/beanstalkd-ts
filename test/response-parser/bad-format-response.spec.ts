import { describe, expect, it } from 'vitest';
import { BeanstalkdResponseParser } from '../../src/response-parser';
import { BadFormatResponse } from '../../src/responses';

describe('bad format response', () => {
  it('should parse bad format response', () => {
    const parser = new BeanstalkdResponseParser();
    const result = parser.read(Buffer.from('BAD_FORMAT\r\n'));

    expect(result).not.toBeNull();
    expect(result).toBeInstanceOf(BadFormatResponse);
  });
});
