import { describe, expect, it } from 'vitest';
import { BeanstalkdResponseParser } from '../../src/response-parser';
import { OutOfMemoryResponse } from '../../src/responses/out-of-memory-response';

describe('out of memory response', () => {
  it('should parse out of memory response', () => {
    const parser = new BeanstalkdResponseParser();
    const result = parser.read(Buffer.from('OUT_OF_MEMORY\r\n'));

    expect(result).not.toBeNull();
    expect(result).toBeInstanceOf(OutOfMemoryResponse);
  });
});
