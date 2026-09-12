import { describe, expect, it } from 'vitest';
import { BeanstalkdResponseParser } from '../../src/response-parser';
import { DlqSetResponse } from '../../src/responses';

describe('dlq set response', () => {
  it('should parse dlq_set response', () => {
    const parser = new BeanstalkdResponseParser();
    const result = parser.read(Buffer.from('DLQ_SET\r\n'));

    expect(result).not.toBeNull();
    expect(result).toBeInstanceOf(DlqSetResponse);
  });
});
