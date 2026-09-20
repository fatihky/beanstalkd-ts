import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import { NotFoundError } from '../errors';
import { type BeanstalkdResponse, FoundResponse, NotFoundResponse } from '../responses';
import { BeanstalkdCommand } from './command';

export type PeekTubeState = 'ready' | 'delayed' | 'buried';

export interface PeekTubeParams {
  tube: string;
  state: PeekTubeState;
}

/**
 * beanstalkd-pi extension: "peek-ready"/"peek-delayed"/"peek-buried"
 * restricted to an explicit tube instead of the connection's currently used
 * tube.
 *
 * @throws {NotFoundError} if the named tube does not exist, or exists but has
 * no job in the requested state.
 */
export class PeekTubeCommand extends BeanstalkdCommand<
  FoundResponse,
  PeekTubeParams
> {
  override compose({ tube, state }: PeekTubeParams): Buffer {
    return Buffer.from(`peek-tube ${tube} ${state}\r\n`);
  }

  override handle(response: BeanstalkdResponse): FoundResponse {
    if (response instanceof FoundResponse) return response;

    if (response instanceof NotFoundResponse) {
      throw new NotFoundError();
    }

    throw new BeanstalkdInvalidResponseError(
      'peek-tube command expects a "found" response',
    );
  }
}
