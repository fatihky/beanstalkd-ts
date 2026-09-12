import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import { DrainingError } from '../errors/draining-error';
import { ExpectedCrlfError } from '../errors/expected-crlf-error';
import { JobTooBigError } from '../errors/job-too-big-error';
import { type BeanstalkdResponse, DrainingResponse } from '../responses';
import { ExpectedCrlfResponse } from '../responses/expected-crlf-response';
import { InsertedResponse } from '../responses/inserted-response';
import { JobTooBigResponse } from '../responses/job-too-big-response';
import { crlf } from '../utils';
import { BeanstalkdCommand } from './command';

export interface PutAtParams {
  pri: number;
  /** absolute Unix timestamp (seconds since the epoch, UTC) the job should become ready at */
  unixTs: number;
  ttr: number;
  data: Buffer | string;
}

/**
 * beanstalkd-pi extension: "put" with an absolute schedule time instead of a
 * relative delay.
 */
export class PutAtCommand extends BeanstalkdCommand<
  InsertedResponse,
  PutAtParams
> {
  /**
   * "put-at <pri> <unix-ts> <ttr> <bytes>\r\n<data>\r\n"
   */
  override compose(arg: PutAtParams): Buffer {
    return Buffer.concat([
      Buffer.from(
        `put-at ${arg.pri} ${arg.unixTs} ${arg.ttr} ${arg.data.length}`,
      ),
      crlf,
      Buffer.from(arg.data),
      crlf,
    ]);
  }

  override handle(response: BeanstalkdResponse): InsertedResponse {
    if (response instanceof InsertedResponse) return response;

    if (response instanceof DrainingResponse) throw new DrainingError();

    if (response instanceof ExpectedCrlfResponse) throw new ExpectedCrlfError();

    if (response instanceof JobTooBigResponse) throw new JobTooBigError();

    throw new BeanstalkdInvalidResponseError(
      'put-at: expected an "inserted" response',
    );
  }
}
