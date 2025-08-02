import assert from 'node:assert';
import { describe, expect, it } from 'vitest';
import { BeanstalkdResponseParser } from '../../src/response-parser';
import { WatchingResponse } from '../../src/responses';

describe('watching response', () => {
  it('should parse watching response', () => {
    const parser = new BeanstalkdResponseParser();
    const result = parser.read(Buffer.from('WATCHING 1234\r\n'));

    expect(result).not.toBeNull();
    expect(result).toBeInstanceOf(WatchingResponse);
    assert(result instanceof WatchingResponse);
    expect(result.watchingTubes).toBe(1234);
  });
});
