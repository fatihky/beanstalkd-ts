import { YamlPayload } from './utils/yaml-payload';

/**
 * beanstalkd-pi extension: per-connection introspection stats, returned by
 * the "stats-conn" and "list-connections" commands.
 */
export class ConnectionStats {
  readonly id: number;
  readonly addr: string;
  readonly tube: string;
  readonly watching: string[];
  readonly reservedJobs: number[];
  readonly producer: boolean;
  readonly worker: boolean;
  readonly waiting: boolean;

  constructor(payload: string) {
    const yaml = new YamlPayload(payload);

    this.id = yaml.readNumber('id');
    this.addr = yaml.readString('addr');
    this.tube = yaml.readString('tube');
    this.watching = yaml.readList('watching');
    this.reservedJobs = yaml.readNumberList('reserved-jobs');
    this.producer = yaml.readBoolean('producer');
    this.worker = yaml.readBoolean('worker');
    this.waiting = yaml.readBoolean('waiting');
  }
}
