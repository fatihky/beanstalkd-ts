import { describe, expect, it } from 'vitest';
import { TouchedResponse } from '../../src';
import { BeanstalkdResponseParser } from '../../src/response-parser';

describe('touched response', () => {
  it('should parse touched response', () => {
    const parser = new BeanstalkdResponseParser();
    const result = parser.read(Buffer.from('TOUCHED\r\n'));

    expect(result).not.toBeNull();
    expect(result).toBeInstanceOf(TouchedResponse);
  });
});
