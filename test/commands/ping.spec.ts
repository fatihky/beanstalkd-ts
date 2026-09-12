import { describe, expect, it } from 'vitest';
import { BeanstalkdInvalidResponseError } from '../../src/beanstalkd-invalid-response-error';
import { ping } from '../../src/commands';
import { PongResponse } from '../../src/responses';

describe('ping command', () => {
  it('composes "ping\\r\\n"', () => {
    expect(ping.compose().toString()).toBe('ping\r\n');
  });

  it('should handle pong response', () => {
    expect(ping.handle(new PongResponse())).toBeUndefined();
  });

  it('should throw on an unexpected response', () => {
    expect(() =>
      // biome-ignore lint/suspicious/noExplicitAny: exercising the invalid-response branch
      ping.handle({} as any),
    ).toThrowError(BeanstalkdInvalidResponseError);
  });
});
