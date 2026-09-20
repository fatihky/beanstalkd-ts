import { describe, expect, it } from 'vitest';
import { BeanstalkdInvalidResponseError } from '../../src/beanstalkd-invalid-response-error';
import { statsTubeAll } from '../../src/commands';
import { OkResponse, TubeStats } from '../../src/responses';

const payload = [
  '---',
  '- name: default',
  '  cmd-delete: 1',
  '  cmd-pause-tube: 0',
  '  current-jobs-buried: 0',
  '  current-jobs-delayed: 0',
  '  current-jobs-ready: 1',
  '  current-jobs-reserved: 0',
  '  current-jobs-urgent: 0',
  '  current-using: 1',
  '  current-waiting: 0',
  '  current-watching: 1',
  '  pause: 0',
  '  pause-time-left: 0',
  '  total-jobs: 1',
  '- name: foo',
  '  cmd-delete: 0',
  '  cmd-pause-tube: 0',
  '  current-jobs-buried: 0',
  '  current-jobs-delayed: 0',
  '  current-jobs-ready: 0',
  '  current-jobs-reserved: 0',
  '  current-jobs-urgent: 0',
  '  current-using: 0',
  '  current-waiting: 0',
  '  current-watching: 0',
  '  pause: 0',
  '  pause-time-left: 0',
  '  total-jobs: 0',
  '',
].join('\n');

describe('stats-tube-all command', () => {
  it('composes "stats-tube-all\\r\\n"', () => {
    expect(statsTubeAll.compose().toString()).toBe('stats-tube-all\r\n');
  });

  it('parses a sequence of tube stats', () => {
    const response = statsTubeAll.handle(new OkResponse(Buffer.from(payload)));

    expect(response).toHaveLength(2);
    expect(response[0]).toBeInstanceOf(TubeStats);
    expect(response[0].name).toBe('default');
    expect(response[0].totalJobs).toBe(1);
    expect(response[1].name).toBe('foo');
  });

  it('should throw on an unexpected response', () => {
    expect(() =>
      // biome-ignore lint/suspicious/noExplicitAny: exercising the invalid-response branch
      statsTubeAll.handle({} as any),
    ).toThrowError(BeanstalkdInvalidResponseError);
  });
});
