import { YamlPayload } from './utils/yaml-payload';

/**
 * Job stats returned from beanstalkd.
 *
 * Reference: https://github.com/beanstalkd/beanstalkd/blob/master/prot.c#L211
 */
export class JobStats {
  readonly id: number;
  readonly tube: string;
  readonly state: string;

  readonly age: number;
  readonly buries: number;
  readonly delay: number;
  readonly file: number;
  readonly kicks: number;
  readonly pri: number;
  readonly releases: number;
  readonly reserves: number;
  readonly timeLeft: number;
  readonly timeouts: number;
  readonly ttr: number;

  constructor(payload: string) {
    const yaml = new YamlPayload(payload);

    this.id = yaml.readNumber('id');
    this.tube = yaml.readString('tube');
    this.state = yaml.readString('state');

    this.age = yaml.readNumber('age');
    this.buries = yaml.readNumber('buries');
    this.delay = yaml.readNumber('delay');
    this.file = yaml.readNumber('file');
    this.kicks = yaml.readNumber('kicks');
    this.pri = yaml.readNumber('pri');
    this.releases = yaml.readNumber('releases');
    this.reserves = yaml.readNumber('reserves');
    this.timeLeft = yaml.readNumber('time-left');
    this.timeouts = yaml.readNumber('timeouts');
    this.ttr = yaml.readNumber('ttr');
  }
}
