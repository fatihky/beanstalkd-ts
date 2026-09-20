import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import { type BeanstalkdResponse, OkResponse, TubeStats } from '../responses';
import { YamlPayload } from '../responses/utils/yaml-payload';
import { crlf } from '../utils';
import { BeanstalkdCommand } from './command';

const cmd = Buffer.concat([Buffer.from('stats-tube-all'), crlf]);

/**
 * beanstalkd-pi extension: "stats-tube"'s fields for every tube in one YAML
 * document, ordered the same way "list-tubes" orders tubes ("default"
 * first, then the rest alphabetically).
 */
export class StatsTubeAllCommand extends BeanstalkdCommand<TubeStats[], void> {
  override compose(): Buffer {
    return cmd;
  }

  override handle(response: BeanstalkdResponse): TubeStats[] {
    if (!(response instanceof OkResponse))
      throw new BeanstalkdInvalidResponseError(
        'stats-tube-all command expects an "ok" response',
      );

    return YamlPayload.splitSequenceEntries(response.data.toString()).map(
      (entry) => new TubeStats(entry),
    );
  }
}
