import { describe, expect, it } from 'vitest';
import { BeanstalkdInvalidResponseError } from '../../src/beanstalkd-invalid-response-error';
import { capabilities } from '../../src/commands';
import { Capabilities, OkResponse } from '../../src/responses';

const payload = [
  '---',
  'version: beanstalkd-pi-1.0.0',
  'max-job-size: 65536',
  'max-tube-name-len: 200',
  'extensions:',
  '- ping',
  '- put-at',
  '- kick-tube',
  '- delete-tube',
  '- peek-tube',
  '- stats-conn',
  '- list-connections',
  '- set-dlq',
  '- capabilities',
  '',
].join('\n');

describe('capabilities command', () => {
  it('composes "capabilities\\r\\n"', () => {
    expect(capabilities.compose().toString()).toBe('capabilities\r\n');
  });

  it('should parse the capabilities payload', () => {
    const response = capabilities.handle(new OkResponse(Buffer.from(payload)));

    expect(response).toBeInstanceOf(Capabilities);
    expect(response.version).toBe('beanstalkd-pi-1.0.0');
    expect(response.maxJobSize).toBe(65536);
    expect(response.maxTubeNameLen).toBe(200);
    expect(response.extensions).toContain('put-at');
    expect(response.supports('put-at')).toBe(true);
    expect(response.supports('capabilities')).toBe(true);
  });

  it('should throw on an unexpected response', () => {
    expect(() =>
      // biome-ignore lint/suspicious/noExplicitAny: exercising the invalid-response branch
      capabilities.handle({} as any),
    ).toThrowError(BeanstalkdInvalidResponseError);
  });
});
