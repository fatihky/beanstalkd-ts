import { describe, expect, it } from 'vitest';
import { BeanstalkdResponseParser } from '../../src/response-parser';
import { NotFoundResponse } from '../../src/responses';

describe('not found response', () => {
  it('should parse not found response', () => {
    const parser = new BeanstalkdResponseParser();
    const result = parser.read(Buffer.from('NOT_FOUND\r\n'));

    expect(result).not.toBeNull();
    expect(result).toBeInstanceOf(NotFoundResponse);
  });
});
