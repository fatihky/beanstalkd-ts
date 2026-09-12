import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import { type BeanstalkdResponse, KickedResponse } from '../responses';
import { BeanstalkdCommand } from './command';

export interface KickTubeParams {
  tube: string;
  /** upper bound on the number of jobs to kick */
  bound: number;
}

/**
 * beanstalkd-pi extension: "kick" restricted to an explicit tube instead of
 * the connection's currently used tube.
 *
 * @throws {NotFoundError} if the named tube does not exist.
 */
export class KickTubeCommand extends BeanstalkdCommand<
  KickedResponse,
  KickTubeParams
> {
  override compose({ tube, bound }: KickTubeParams): Buffer {
    return Buffer.from(`kick-tube ${tube} ${bound}\r\n`);
  }

  override handle(response: BeanstalkdResponse): KickedResponse {
    if (response instanceof KickedResponse) return response;

    throw new BeanstalkdInvalidResponseError(
      'kick-tube command expects a "kicked" response',
    );
  }
}
