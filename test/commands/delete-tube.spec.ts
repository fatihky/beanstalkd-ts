import { describe, expect, it } from 'vitest';
import { BeanstalkdInvalidResponseError } from '../../src/beanstalkd-invalid-response-error';
import { deleteTube } from '../../src/commands';
import { TubeDeletedResponse } from '../../src/responses';

describe('delete-tube command', () => {
  it('composes "delete-tube <tube>\\r\\n"', () => {
    expect(deleteTube.compose('foo').toString()).toBe('delete-tube foo\r\n');
  });

  it('should handle "deleted" response', () => {
    const response = deleteTube.handle(new TubeDeletedResponse(2));

    expect(response).toBeInstanceOf(TubeDeletedResponse);
    expect(response.jobCount).toBe(2);
  });

  it('should throw on an unexpected response', () => {
    expect(() =>
      // biome-ignore lint/suspicious/noExplicitAny: exercising the invalid-response branch
      deleteTube.handle({} as any),
    ).toThrowError(BeanstalkdInvalidResponseError);
  });
});
