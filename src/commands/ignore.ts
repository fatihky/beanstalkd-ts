import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import { type BeanstalkdResponse, WatchingResponse } from '../responses';
import { TubeCommand } from './base/tube-command';

export class IgnoreCommand extends TubeCommand<WatchingResponse> {
  constructor() {
    super('ignore');
  }

  override handle(response: BeanstalkdResponse): WatchingResponse {
    if (response instanceof WatchingResponse) return response;

    throw new BeanstalkdInvalidResponseError(
      'ignore command expects "watching" response',
    );
  }
}
