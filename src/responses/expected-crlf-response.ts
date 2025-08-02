import { BeanstalkdResponse } from './beanstalkd-response';

const raw = Buffer.from('EXPECTED_CRLF\r\n');

export class ExpectedCrlfResponse extends BeanstalkdResponse {
  static readonly raw = raw;
}
