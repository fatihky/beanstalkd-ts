import { describe, expect, it } from 'vitest';
import { BeanstalkdResponseParser } from '../../src/response-parser';
import { UnknownCommandResponse } from '../../src/responses/unknown-command-response';

describe('unknown command response', () => {
  it('should parse unknown command response', () => {
    const parser = new BeanstalkdResponseParser();
    const result = parser.read(Buffer.from('UNKNOWN_COMMAND\r\n'));

    expect(result).not.toBeNull();
    expect(result).toBeInstanceOf(UnknownCommandResponse);
  });
});
