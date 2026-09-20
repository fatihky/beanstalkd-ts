import { YamlPayload } from './utils/yaml-payload';

/**
 * beanstalkd-pi extension: one job entry in a "list-jobs" reply.
 */
export class JobListEntry {
  readonly id: number;
  readonly pri: number;
  /** seconds since the job was created (same meaning as `JobStats.age`) */
  readonly age: number;
  /** the job's body size in bytes, excluding the trailing "\r\n" */
  readonly size: number;
  /** seconds until the job becomes ready; present only when listing the "delayed" state */
  readonly timeLeft?: number;

  constructor(payload: string) {
    const yaml = new YamlPayload(payload);

    this.id = yaml.readNumber('id');
    this.pri = yaml.readNumber('pri');
    this.age = yaml.readNumber('age');
    this.size = yaml.readNumber('size');
    this.timeLeft = yaml.readNumberOrUndefined('time-left');
  }
}
