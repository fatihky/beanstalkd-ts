import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import { NotIgnoredError } from '../errors';
import {
  type BeanstalkdResponse,
  NotIgnoredResponse,
  WatchingResponse,
} from '../responses';
import { TubeCommand } from './base/tube-command';

export class IgnoreCommand extends TubeCommand<WatchingResponse> {
  constructor() {
    super('ignore');
  }

  override handle(response: BeanstalkdResponse): WatchingResponse {
    if (response instanceof WatchingResponse) return response;

    if (response instanceof NotIgnoredResponse) {
      throw new NotIgnoredError();
    }

    throw new BeanstalkdInvalidResponseError(
      'ignore command expects "watching" or "not_ignored" response',
    );
  }
}
