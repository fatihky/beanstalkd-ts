import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import { DrainingError } from '../errors/draining-error';
import { ExpectedCrlfError } from '../errors/expected-crlf-error';
import { JobBuriedError } from '../errors/job-buried-error';
import { JobTooBigError } from '../errors/job-too-big-error';
import { type BeanstalkdResponse, DrainingResponse } from '../responses';
import { ExpectedCrlfResponse } from '../responses/expected-crlf-response';
import { InsertedResponse } from '../responses/inserted-response';
import { JobBuriedResponse } from '../responses/job-buried-response';
import { JobTooBigResponse } from '../responses/job-too-big-response';
import { crlf } from '../utils';
import { BeanstalkdCommand } from './command';

export interface PutParams {
  delay: number;
  pri: number;
  ttr: number;
  data: Buffer | string;
}

export class PutCommand extends BeanstalkdCommand<
  InsertedResponse | JobBuriedResponse,
  PutParams
> {
  /**
   * "put <pri> <delay> <ttr> <bytes>\r\n<data>\r\n"
   */
  override compose(arg: PutParams): Buffer {
    return Buffer.concat([
      Buffer.from(`put ${arg.pri} ${arg.delay} ${arg.ttr} ${arg.data.length}`),
      crlf,
      Buffer.from(arg.data),
      crlf,
    ]);
  }

  override handle(response: BeanstalkdResponse): InsertedResponse {
    // we expect inserted response so we check it first
    if (response instanceof InsertedResponse) return response;

    // rest of the checks are alphabetically sorted
    if (response instanceof JobBuriedResponse)
      throw new JobBuriedError(response.jobId);

    if (response instanceof DrainingResponse) throw new DrainingError();

    if (response instanceof ExpectedCrlfResponse) throw new ExpectedCrlfError();

    if (response instanceof JobTooBigResponse) throw new JobTooBigError();

    throw new BeanstalkdInvalidResponseError(
      'put: expected an "inserted" response',
    );
  }
}
