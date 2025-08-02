import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import { type BeanstalkdResponse, UsingTubeResponse } from '../responses';
import { BeanstalkdCommand } from './command';

export class UseCommand extends BeanstalkdCommand<UsingTubeResponse, string> {
  override compose(tube: string): Buffer {
    return Buffer.from(`use ${tube}\r\n`);
  }

  override handle(response: BeanstalkdResponse): UsingTubeResponse {
    if (response instanceof UsingTubeResponse) {
      return response;
    }

    throw new BeanstalkdInvalidResponseError(
      `use: got an invalid response: ${response}`,
    );
  }
}
