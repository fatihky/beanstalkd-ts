import { YamlPayload } from './utils/yaml-payload';

/**
 * The nine beanstalkd-pi extension commands, i.e. every command with no
 * stock beanstalkd equivalent. Matches the "extensions" list returned by
 * the "capabilities" command.
 */
export type BeanstalkdExtension =
  | 'ping'
  | 'put-at'
  | 'kick-tube'
  | 'delete-tube'
  | 'peek-tube'
  | 'stats-conn'
  | 'list-connections'
  | 'set-dlq'
  | 'capabilities';

/**
 * beanstalkd-pi extension: what the connected server supports, returned by
 * the "capabilities" command. Stock beanstalkd has no such command at all;
 * see `BeanstalkdClient.detectCapabilities` for a way to probe for it
 * without having to catch `UnkownCommandError` yourself.
 */
export class Capabilities {
  readonly version: string;
  readonly maxJobSize: number;
  readonly maxTubeNameLen: number;
  readonly extensions: BeanstalkdExtension[];

  constructor(payload: string) {
    const yaml = new YamlPayload(payload);

    this.version = yaml.readString('version');
    this.maxJobSize = yaml.readNumber('max-job-size');
    this.maxTubeNameLen = yaml.readNumber('max-tube-name-len');
    this.extensions = yaml.readList('extensions') as BeanstalkdExtension[];
  }

  /** whether the server reported support for the given extension command. */
  supports(extension: BeanstalkdExtension): boolean {
    return this.extensions.includes(extension);
  }
}
