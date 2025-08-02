import { describe, expect, it } from 'vitest';
import { BeanstalkdResponseParser } from '../../src/response-parser';
import { DeadlineSoonResponse } from '../../src/responses/deadline-soon-response';

describe('deadline soon response', () => {
  it('should parse deadline soon response', () => {
    const parser = new BeanstalkdResponseParser();
    const result = parser.read(Buffer.from('DEADLINE_SOON\r\n'));

    expect(result).not.toBeNull();
    expect(result).toBeInstanceOf(DeadlineSoonResponse);
  });
});
