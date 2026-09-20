import { describe, expect, it } from 'vitest';
import { BeanstalkdInvalidResponseError } from '../../../src/beanstalkd-invalid-response-error';
import { YamlPayload } from '../../../src/responses/utils/yaml-payload';

describe('YamlPayload', () => {
  it('keeps a colon-containing value intact (e.g. a "host:port" addr)', () => {
    const yaml = new YamlPayload('---\naddr: 127.0.0.1:54321\n');

    expect(yaml.readString('addr')).toBe('127.0.0.1:54321');
  });

  it('reads flow-style lists', () => {
    const yaml = new YamlPayload(
      '---\nwatching: [default, foo]\nreserved-jobs: [101, 102]\nempty: []\n',
    );

    expect(yaml.readList('watching')).toStrictEqual(['default', 'foo']);
    expect(yaml.readNumberList('reserved-jobs')).toStrictEqual([101, 102]);
    expect(yaml.readList('empty')).toStrictEqual([]);
  });

  it('reads block-style lists', () => {
    const yaml = new YamlPayload(
      '---\nversion: beanstalkd-pi-1.0.0\nextensions:\n- ping\n- put-at\n',
    );

    expect(yaml.readString('version')).toBe('beanstalkd-pi-1.0.0');
    expect(yaml.readBlockList('extensions')).toStrictEqual(['ping', 'put-at']);
  });

  it('treats a genuinely empty value as a blank string, not a list', () => {
    const yaml = new YamlPayload('---\ndlq-tube:\ndlq-max-attempts: 0\n');

    expect(yaml.readOptionalString('dlq-tube')).toBe('');
    expect(() => yaml.readBlockList('dlq-tube')).toThrowError(
      BeanstalkdInvalidResponseError,
    );
  });

  it('reads booleans', () => {
    const yaml = new YamlPayload('---\na: true\nb: false\n');

    expect(yaml.readBoolean('a')).toBe(true);
    expect(yaml.readBoolean('b')).toBe(false);
  });

  it('falls back on missing optional keys', () => {
    const yaml = new YamlPayload('---\nfoo: bar\n');

    expect(yaml.readOptionalString('dlq-tube')).toBe('');
    expect(yaml.readOptionalString('dlq-tube', 'n/a')).toBe('n/a');
    expect(yaml.readOptionalNumber('dlq-max-attempts')).toBe(0);
    expect(yaml.readOptionalNumber('dlq-max-attempts', -1)).toBe(-1);
  });

  it('reads an optional number as undefined when absent, e.g. "time-left" for a non-delayed list-jobs entry', () => {
    const withKey = new YamlPayload('---\nid: 1\ntime-left: 42\n');
    const withoutKey = new YamlPayload('---\nid: 1\n');

    expect(withKey.readNumberOrUndefined('time-left')).toBe(42);
    expect(withoutKey.readNumberOrUndefined('time-left')).toBeUndefined();
  });

  it('throws for a non-list value', () => {
    const yaml = new YamlPayload('---\nfoo: bar\n');

    expect(() => yaml.readList('foo')).toThrowError(
      BeanstalkdInvalidResponseError,
    );
  });

  describe('splitSequenceEntries', () => {
    it('splits a YAML sequence of mappings into per-entry mapping text', () => {
      const entries = YamlPayload.splitSequenceEntries(
        [
          '---',
          '- id: 1',
          '  tube: default',
          '- id: 2',
          '  tube: foo',
          '',
        ].join('\n'),
      );

      expect(entries).toHaveLength(2);

      const first = new YamlPayload(entries[0]);
      const second = new YamlPayload(entries[1]);

      expect(first.readNumber('id')).toBe(1);
      expect(first.readString('tube')).toBe('default');
      expect(second.readNumber('id')).toBe(2);
      expect(second.readString('tube')).toBe('foo');
    });
  });
});
