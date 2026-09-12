import { describe, expect, it } from 'vitest';
import { BeanstalkdInvalidResponseError } from '../../src/beanstalkd-invalid-response-error';
import { peekTube } from '../../src/commands';
import { FoundResponse } from '../../src/responses';

describe('peek-tube command', () => {
  it('composes "peek-tube <tube> <state>\\r\\n"', () => {
    expect(peekTube.compose({ tube: 'foo', state: 'ready' }).toString()).toBe(
      'peek-tube foo ready\r\n',
    );
  });

  it('should handle found response', () => {
    const response = new FoundResponse(1, Buffer.from('payload'));

    expect(peekTube.handle(response)).toBeInstanceOf(FoundResponse);
  });

  it('should throw on an unexpected response', () => {
    expect(() =>
      // biome-ignore lint/suspicious/noExplicitAny: exercising the invalid-response branch
      peekTube.handle({} as any),
    ).toThrowError(BeanstalkdInvalidResponseError);
  });
});
