import { describe, expect, it } from 'vitest';
import { BeanstalkdInvalidResponseError } from '../../src/beanstalkd-invalid-response-error';
import { drain } from '../../src/commands';
import { DrainingResponse, NotDrainingResponse } from '../../src/responses';

describe('drain command', () => {
  it('composes "drain on\\r\\n"', () => {
    expect(drain.compose('on').toString()).toBe('drain on\r\n');
  });

  it('composes "drain off\\r\\n"', () => {
    expect(drain.compose('off').toString()).toBe('drain off\r\n');
  });

  it('composes "drain status\\r\\n"', () => {
    expect(drain.compose('status').toString()).toBe('drain status\r\n');
  });

  it('resolves to true on a "draining" response', () => {
    expect(drain.handle(new DrainingResponse())).toBe(true);
  });

  it('resolves to false on a "not_draining" response', () => {
    expect(drain.handle(new NotDrainingResponse())).toBe(false);
  });

  it('should throw on an unexpected response', () => {
    expect(() =>
      // biome-ignore lint/suspicious/noExplicitAny: exercising the invalid-response branch
      drain.handle({} as any),
    ).toThrowError(BeanstalkdInvalidResponseError);
  });
});
