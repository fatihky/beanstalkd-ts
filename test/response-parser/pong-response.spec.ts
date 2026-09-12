import { describe, expect, it } from 'vitest';
import { BeanstalkdResponseParser } from '../../src/response-parser';
import { PongResponse } from '../../src/responses';

describe('pong response', () => {
  it('should parse pong response', () => {
    const parser = new BeanstalkdResponseParser();
    const result = parser.read(Buffer.from('PONG\r\n'));

    expect(result).not.toBeNull();
    expect(result).toBeInstanceOf(PongResponse);
  });
});
