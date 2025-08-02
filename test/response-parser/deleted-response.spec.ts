import { describe, expect, it } from 'vitest';
import { BeanstalkdResponseParser } from '../../src/response-parser';
import { DeletedResponse } from '../../src/responses';

describe('deleted response', () => {
  it('should parse deleted response', () => {
    const parser = new BeanstalkdResponseParser();
    const result = parser.read(Buffer.from('DELETED\r\n'));

    expect(result).not.toBeNull();
    expect(result).toBeInstanceOf(DeletedResponse);
  });
});
