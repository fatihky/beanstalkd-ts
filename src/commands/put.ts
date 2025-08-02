import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import type { BeanstalkdResponse } from '../responses';
import { InsertedResponse } from '../responses/inserted-response';
import { crlf } from '../utils';
import { BeanstalkdCommand } from './command';

export interface PutParams {
  delay: number;
  pri: number;
  ttr: number;
  data: Buffer | string;
}

export class PutCommand extends BeanstalkdCommand<InsertedResponse, PutParams> {
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
    if (response instanceof InsertedResponse) return response;

    throw new BeanstalkdInvalidResponseError(
      'put: expected an "inserted" response',
    );
  }
}
