import { describe, expect, it } from 'vitest';
import { BeanstalkdInvalidResponseError } from '../../src/beanstalkd-invalid-response-error';
import { setDlq } from '../../src/commands';
import { DlqSetResponse } from '../../src/responses';

describe('set-dlq command', () => {
  it('composes "set-dlq <tube> <max-attempts> <dead-tube>\\r\\n"', () => {
    expect(
      setDlq
        .compose({ tube: 'foo', maxAttempts: 3, deadTube: 'foo-dead' })
        .toString(),
    ).toBe('set-dlq foo 3 foo-dead\r\n');
  });

  it('should handle dlq_set response', () => {
    expect(setDlq.handle(new DlqSetResponse())).toBeUndefined();
  });

  it('should throw on an unexpected response', () => {
    expect(() =>
      // biome-ignore lint/suspicious/noExplicitAny: exercising the invalid-response branch
      setDlq.handle({} as any),
    ).toThrowError(BeanstalkdInvalidResponseError);
  });
});
