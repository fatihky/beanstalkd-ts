import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import { type BeanstalkdResponse, UsingTubeResponse } from '../responses';
import { BeanstalkdCommand } from './command';

const cmd = Buffer.from('list-tube-used\r\n');

export class ListTubeUsedCommand extends BeanstalkdCommand<
  UsingTubeResponse,
  void
> {
  override compose(): Buffer {
    return cmd;
  }

  override handle(response: BeanstalkdResponse): UsingTubeResponse {
    if (response instanceof UsingTubeResponse) return response;

    throw new BeanstalkdInvalidResponseError(
      'list-tube-used expects "using" response',
    );
  }
}
