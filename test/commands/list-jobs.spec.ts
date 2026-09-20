import { describe, expect, it } from 'vitest';
import { BeanstalkdInvalidResponseError } from '../../src/beanstalkd-invalid-response-error';
import { listJobs } from '../../src/commands';
import { JobListEntry, OkResponse } from '../../src/responses';

const readyPayload = [
  '---',
  '- id: 1',
  '  pri: 1024',
  '  age: 5',
  '  size: 10',
  '- id: 2',
  '  pri: 512',
  '  age: 1',
  '  size: 20',
  '',
].join('\n');

const delayedPayload = [
  '---',
  '- id: 3',
  '  pri: 1024',
  '  age: 5',
  '  size: 10',
  '  time-left: 42',
  '',
].join('\n');

describe('list-jobs command', () => {
  it('composes "list-jobs <tube> <state>\\r\\n" without a limit', () => {
    expect(listJobs.compose({ tube: 'foo', state: 'ready' }).toString()).toBe(
      'list-jobs foo ready\r\n',
    );
  });

  it('composes "list-jobs <tube> <state> <limit>\\r\\n" with a limit', () => {
    expect(
      listJobs.compose({ tube: 'foo', state: 'buried', limit: 50 }).toString(),
    ).toBe('list-jobs foo buried 50\r\n');
  });

  it('parses a sequence of ready jobs, without "time-left"', () => {
    const response = listJobs.handle(new OkResponse(Buffer.from(readyPayload)));

    expect(response).toHaveLength(2);
    expect(response[0]).toBeInstanceOf(JobListEntry);
    expect(response[0].id).toBe(1);
    expect(response[0].pri).toBe(1024);
    expect(response[0].age).toBe(5);
    expect(response[0].size).toBe(10);
    expect(response[0].timeLeft).toBeUndefined();
    expect(response[1].id).toBe(2);
  });

  it('parses "time-left" for delayed jobs', () => {
    const response = listJobs.handle(
      new OkResponse(Buffer.from(delayedPayload)),
    );

    expect(response).toHaveLength(1);
    expect(response[0].timeLeft).toBe(42);
  });

  it('should throw on an unexpected response', () => {
    expect(() =>
      // biome-ignore lint/suspicious/noExplicitAny: exercising the invalid-response branch
      listJobs.handle({} as any),
    ).toThrowError(BeanstalkdInvalidResponseError);
  });
});
