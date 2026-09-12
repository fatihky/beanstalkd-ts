/**
 * Parse yaml payload returned from beanstalkd
 *
 * The commands that return a yaml payload are include:
 * - stats
 * - stats-tube
 * - stats-job
 * - stats-conn (beanstalkd-pi extension)
 * - capabilities (beanstalkd-pi extension)
 */

import { BeanstalkdInvalidResponseError } from '../../beanstalkd-invalid-response-error';

/** parse a YAML flow-style sequence, e.g. "[default, foo]" or "[]" */
function parseFlowList(raw: string): string[] {
  const trimmed = raw.trim();

  if (!trimmed.startsWith('[') || !trimmed.endsWith(']'))
    throw new BeanstalkdInvalidResponseError(
      `expected a flow-style list (e.g. "[a, b]"), got: "${raw}"`,
    );

  const inner = trimmed.slice(1, -1).trim();

  if (inner === '') return [];

  return inner.split(',').map((s) => s.trim());
}

export class YamlPayload {
  private values: Record<string, string>;

  constructor(payload: string) {
    this.values = Object.fromEntries(
      payload
        .trim()
        .split('\n')
        // ignore header line ("---") see
        // - stats: https://github.com/beanstalkd/beanstalkd/blob/master/prot.c#L140
        // - stats-tube: https://github.com/beanstalkd/beanstalkd/blob/master/prot.c#L194
        // - stats-job: https://github.com/beanstalkd/beanstalkd/blob/master/prot.c#L211
        .slice(1)
        .map((line) => {
          // split on the first colon only: values like "addr" (a "host:port"
          // string) or a flow-style list contain colons/commas of their own.
          const colonIndex = line.indexOf(':');
          const key = line.slice(0, colonIndex);
          const value = line.slice(colonIndex + 1).trim();

          return [key, value];
        }),
    );
  }

  /**
   * Split a YAML sequence of mappings (e.g. list-connections' reply) into one
   * YAML-mapping string per entry, each consumable by `new YamlPayload(...)`.
   *
   * Expects the beanstalkd-pi shape:
   *
   *     ---
   *     - key: value
   *       key: value
   *     - key: value
   *       key: value
   */
  static splitSequenceEntries(payload: string): string[] {
    const lines = payload.trim().split('\n');
    const body = lines[0]?.trim() === '---' ? lines.slice(1) : lines;
    const entries: string[][] = [];

    for (const line of body) {
      if (line.startsWith('- ')) {
        entries.push([line.slice(2)]);
      } else if (line.startsWith('  ') && entries.length > 0) {
        entries[entries.length - 1].push(line.slice(2));
      }
    }

    return entries.map((entryLines) => ['---', ...entryLines].join('\n'));
  }

  readNumber(key: string): number {
    if (!(key in this.values)) {
      throw new BeanstalkdInvalidResponseError(
        `response paylaod does not include ${key}`,
      );
    }

    const val = Number(this.values[key]);

    if (Number.isNaN(val))
      throw new BeanstalkdInvalidResponseError(
        `response payload contains an invalid value for key "${key}". expected a number, got: "${this.values[key]}"`,
      );

    return val;
  }

  /** like `readNumber`, but returns `fallback` (default: 0) instead of throwing when `key` is absent. */
  readOptionalNumber(key: string, fallback = 0): number {
    return key in this.values ? this.readNumber(key) : fallback;
  }

  readString(key: string): string {
    if (!(key in this.values)) {
      throw new BeanstalkdInvalidResponseError(
        `response payload does not include ${key}`,
      );
    }

    return this.values[key];
  }

  /** like `readString`, but returns `fallback` (default: "") instead of throwing when `key` is absent. */
  readOptionalString(key: string, fallback = ''): string {
    return key in this.values ? this.values[key] : fallback;
  }

  /** read a "true"/"false" value as a boolean. */
  readBoolean(key: string): boolean {
    return this.readString(key) === 'true';
  }

  /** read a YAML flow-style list of strings, e.g. "[default, foo]" or "[]". */
  readList(key: string): string[] {
    return parseFlowList(this.readString(key));
  }

  /** read a YAML flow-style list of integers, e.g. "[101, 102]" or "[]". */
  readNumberList(key: string): number[] {
    return this.readList(key).map((s) => {
      const val = Number(s);

      if (Number.isNaN(val))
        throw new BeanstalkdInvalidResponseError(
          `response payload contains an invalid value for key "${key}". expected a list of numbers, got: "${this.values[key]}"`,
        );

      return val;
    });
  }
}
