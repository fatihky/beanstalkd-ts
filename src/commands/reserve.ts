import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import {
  BeanstalkdJob,
  type BeanstalkdResponse,
  ReservedResponse,
} from '../responses';
import { BeanstalkdCommand } from './command';

const cmd = Buffer.from('reserve\r\n');

export class ReserveCommand extends BeanstalkdCommand<BeanstalkdJob, void> {
  override compose(): Buffer {
    return cmd;
  }

  override handle(response: BeanstalkdResponse): BeanstalkdJob {
    if (response instanceof ReservedResponse) {
      return new BeanstalkdJob(response.jobId, response.payload);
    }

    throw new BeanstalkdInvalidResponseError(
      'reserve command expects "reserved response"',
    );
  }
}
