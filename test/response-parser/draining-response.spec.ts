import { describe, expect, it } from 'vitest';
import { BeanstalkdResponseParser } from '../../src/response-parser';
import { DrainingResponse } from '../../src/responses';

describe('draining response', () => {
  it('should parse draining response', () => {
    const parser = new BeanstalkdResponseParser();
    const result = parser.read(Buffer.from('DRAINING\r\n'));

    expect(result).not.toBeNull();
    expect(result).toBeInstanceOf(DrainingResponse);
  });
});
