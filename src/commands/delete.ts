import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import { type BeanstalkdResponse, DeletedResponse } from '../responses';
import { BeanstalkdCommand } from './command';

export class DeleteCommand extends BeanstalkdCommand<DeletedResponse, number> {
  override compose(jobId: number): Buffer {
    return Buffer.from(`delete ${jobId}\r\n`);
  }

  override handle(response: BeanstalkdResponse): DeletedResponse {
    if (response instanceof DeletedResponse) {
      return response;
    }

    throw new BeanstalkdInvalidResponseError(
      'delete command expects "deleted response"',
    );
  }
}
