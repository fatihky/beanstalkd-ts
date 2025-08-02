import { describe, expect, it } from 'vitest';
import { BeanstalkdResponseParser } from '../../src/response-parser';
import { BuriedResponse } from '../../src/responses';

describe('buried response', () => {
  it('should parse buried response', () => {
    const parser = new BeanstalkdResponseParser();
    const result = parser.read(Buffer.from('BURIED\r\n'));

    expect(result).not.toBeNull();
    expect(result).toBeInstanceOf(BuriedResponse);
  });
});
