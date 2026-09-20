import { describe, expect, it } from 'vitest';
import { BeanstalkdResponseParser } from '../../src/response-parser';
import { NotDrainingResponse } from '../../src/responses';

describe('not draining response', () => {
  it('should parse not_draining response', () => {
    const parser = new BeanstalkdResponseParser();
    const result = parser.read(Buffer.from('NOT_DRAINING\r\n'));

    expect(result).not.toBeNull();
    expect(result).toBeInstanceOf(NotDrainingResponse);
  });
});
