import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import { type BeanstalkdResponse, PausedResponse } from '../responses';
import { BeanstalkdCommand } from './command';

export class PauseTubeCommand extends BeanstalkdCommand<
  PausedResponse,
  { tube: string; delay: number }
> {
  override compose({ tube, delay }: { tube: string; delay: number }): Buffer {
    return Buffer.from(`pause-tube ${tube} ${delay}\r\n`);
  }

  override handle(response: BeanstalkdResponse): PausedResponse {
    if (response instanceof PausedResponse) return response;

    throw new BeanstalkdInvalidResponseError(
      'pause command expects "paused" response',
    );
  }
}
