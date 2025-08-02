import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import { type BeanstalkdResponse, UsingTubeResponse } from '../responses';
import { TubeCommand } from './base/tube-command';

export class UseCommand extends TubeCommand<UsingTubeResponse> {
  constructor() {
    super('use');
  }

  override handle(response: BeanstalkdResponse): UsingTubeResponse {
    if (response instanceof UsingTubeResponse) return response;

    throw new BeanstalkdInvalidResponseError(
      `use: got an invalid response: ${response}`,
    );
  }
}
