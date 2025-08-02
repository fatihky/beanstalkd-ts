import assert from 'node:assert';
import { describe, expect, it } from 'vitest';
import { BeanstalkdResponseParser } from '../../src/response-parser';
import { ExpectedCrlfResponse } from '../../src/responses';

describe('expected crlf response', () => {
  it('should parse expected crlf response', () => {
    const parser = new BeanstalkdResponseParser();
    const result = parser.read(Buffer.from('EXPECTED_CRLF\r\n'));

    expect(result).not.toBeNull();
    expect(result).toBeInstanceOf(ExpectedCrlfResponse);
    assert(result instanceof ExpectedCrlfResponse);
  });
});
