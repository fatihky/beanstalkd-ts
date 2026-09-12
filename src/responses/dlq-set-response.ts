import { BeanstalkdResponse } from './beanstalkd-response';

const raw = Buffer.from('DLQ_SET\r\n');

/**
 * beanstalkd-pi extension: reply to the "set-dlq" command.
 */
export class DlqSetResponse extends BeanstalkdResponse {
  static readonly raw = raw;
}
