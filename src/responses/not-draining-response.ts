import { BeanstalkdResponse } from './beanstalkd-response';

const raw = Buffer.from('NOT_DRAINING\r\n');

/**
 * beanstalkd-pi extension: reply to the "drain" command when drain mode is
 * off after the command runs (as opposed to `DrainingResponse`, sent when
 * it's on).
 */
export class NotDrainingResponse extends BeanstalkdResponse {
  static readonly raw = raw;
}
