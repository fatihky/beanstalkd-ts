import { describe, expect, it } from 'vitest';
import { BeanstalkdResponseParser } from '../../src/response-parser';
import { InternalErrorResponse } from '../../src/responses/internal-error-response';

describe('internal error response', () => {
  it('should parse internal error response', () => {
    const parser = new BeanstalkdResponseParser();
    const result = parser.read(Buffer.from('INTERNAL_ERROR\r\n'));

    expect(result).not.toBeNull();
    expect(result).toBeInstanceOf(InternalErrorResponse);
  });
});
