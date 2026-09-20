import { describe, expect, it } from 'vitest';
import { BeanstalkdInvalidResponseError } from '../../src/beanstalkd-invalid-response-error';
import { listTubesPaused } from '../../src/commands';
import { OkResponse } from '../../src/responses';

describe('list-tubes-paused command', () => {
  it('composes "list-tubes-paused\\r\\n"', () => {
    expect(listTubesPaused.compose().toString()).toBe('list-tubes-paused\r\n');
  });

  it('parses a sequence of paused tube names', () => {
    const payload = ['---', '- bar', '- foo', ''].join('\n');
    const response = listTubesPaused.handle(
      new OkResponse(Buffer.from(payload)),
    );

    expect(response).toStrictEqual(['bar', 'foo']);
  });

  it('returns an empty array when no tube is paused', () => {
    const response = listTubesPaused.handle(
      new OkResponse(Buffer.from('---\n')),
    );

    expect(response).toStrictEqual([]);
  });

  it('should throw on an unexpected response', () => {
    expect(() =>
      // biome-ignore lint/suspicious/noExplicitAny: exercising the invalid-response branch
      listTubesPaused.handle({} as any),
    ).toThrowError(BeanstalkdInvalidResponseError);
  });
});
