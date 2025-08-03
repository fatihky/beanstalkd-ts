/**
 * Parse yaml payload returned from beanstalkd
 *
 * The commands that return a yaml payload are include:
 * - stats
 * - stats-tube
 * - stats-job
 */

import { BeanstalkdInvalidResponseError } from '../../beanstalkd-invalid-response-error';

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
          const [key, value] = line.split(':');

          return [key, value.trim()];
        }),
    );
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

  readString(key: string): string {
    if (!(key in this.values)) {
      throw new BeanstalkdInvalidResponseError(
        `response payload does not include ${key}`,
      );
    }

    return this.values[key];
  }
}
