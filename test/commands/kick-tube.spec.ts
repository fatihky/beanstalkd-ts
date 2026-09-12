import { describe, expect, it } from 'vitest';
import { BeanstalkdInvalidResponseError } from '../../src/beanstalkd-invalid-response-error';
import { kickTube } from '../../src/commands';
import { KickedResponse } from '../../src/responses';

describe('kick-tube command', () => {
  it('composes "kick-tube <tube> <bound>\\r\\n"', () => {
    expect(kickTube.compose({ tube: 'foo', bound: 5 }).toString()).toBe(
      'kick-tube foo 5\r\n',
    );
  });

  it('should handle kicked response', () => {
    expect(kickTube.handle(new KickedResponse(3))).toBeInstanceOf(
      KickedResponse,
    );
  });

  it('should throw on an unexpected response', () => {
    expect(() =>
      // biome-ignore lint/suspicious/noExplicitAny: exercising the invalid-response branch
      kickTube.handle({} as any),
    ).toThrowError(BeanstalkdInvalidResponseError);
  });
});
