import assert from 'node:assert';
import { describe, expect, it } from 'vitest';
import { BeanstalkdResponseParser } from '../../src/response-parser';
import { DeletedResponse, TubeDeletedResponse } from '../../src/responses';

describe('tube deleted response', () => {
  it('should parse "delete-tube"\'s "DELETED <count>" response', () => {
    const parser = new BeanstalkdResponseParser();
    const result = parser.read(Buffer.from('DELETED 5\r\n'));

    expect(result).not.toBeNull();
    expect(result).toBeInstanceOf(TubeDeletedResponse);
    assert(result instanceof TubeDeletedResponse);
    expect(result.jobCount).toBe(5);
  });

  it('should not be confused with the constant "delete" response', () => {
    const parser = new BeanstalkdResponseParser();
    const result = parser.read(Buffer.from('DELETED\r\n'));

    expect(result).toBeInstanceOf(DeletedResponse);
  });
});
