import assert from 'node:assert';
import { describe, expect, it } from 'vitest';
import { BeanstalkdResponseParser } from '../../src/response-parser';
import { UsingTubeResponse } from '../../src/responses';

describe('using tube response', () => {
  it('should parse using tube response', () => {
    const parser = new BeanstalkdResponseParser();
    const result = parser.read(Buffer.from('USING test-tube\r\n'));

    expect(result).toBeInstanceOf(UsingTubeResponse);
    assert(result instanceof UsingTubeResponse);
    expect(result.tube).toBe('test-tube');
  });
});
