import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import { type BeanstalkdResponse, WatchingResponse } from '../responses';
import { TubeCommand } from './base/tube-command';

export class WatchCommand extends TubeCommand<WatchingResponse> {
  constructor() {
    super('watch');
  }

  override handle(response: BeanstalkdResponse): WatchingResponse {
    if (response instanceof WatchingResponse) return response;

    throw new BeanstalkdInvalidResponseError(
      'watch command expects "watching" response',
    );
  }
}
