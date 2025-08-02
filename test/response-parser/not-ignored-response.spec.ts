import { describe, expect, it } from 'vitest';
import { BeanstalkdResponseParser } from '../../src/response-parser';
import { NotIgnoredResponse } from '../../src/responses';

describe('not ignored response', () => {
  it('should parse not ignored response', () => {
    const parser = new BeanstalkdResponseParser();
    const result = parser.read(Buffer.from('NOT_IGNORED\r\n'));

    expect(result).not.toBeNull();
    expect(result).toBeInstanceOf(NotIgnoredResponse);
  });
});
