import { describe, expect, it } from 'vitest';
import { BeanstalkdResponseParser } from '../../src/response-parser';
import { TimedOutResponse } from '../../src/responses/timed-out-response';

describe('timed out response', () => {
  it('should parse timed out response', () => {
    const parser = new BeanstalkdResponseParser();
    const result = parser.read(Buffer.from('TIMED_OUT\r\n'));

    expect(result).not.toBeNull();
    expect(result).toBeInstanceOf(TimedOutResponse);
  });
});
