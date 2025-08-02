/**
 * Beanstalkd protocol parser
 * Parses beanstalkd's responses
 */
import { BeanstalkdResponseOk } from './response';
import { BeanstalkdResponse } from './response/BeanstalkdResponse';
import { bufStartsWith } from './utils';

const empty = Buffer.alloc(0);

export class BeanstalkdResponseParser {
  private buf = empty;

  read(buf: Buffer): BeanstalkdResponse | null {
    const data = this.buf.length > 0 ? Buffer.concat([this.buf, buf]) : buf;

    // we expect to receive the OK response most of the time.
    // so first try to parse that, otherwise try the other responses.
    if (bufStartsWith(data, BeanstalkdResponseOk.prefix))
      return this.handleParseResult(data, BeanstalkdResponseOk.parse(data));

    return null;
  }

  private handleParseResult(
    data: Buffer,
    result: BeanstalkdResponse | [BeanstalkdResponse, Buffer] | null,
  ): BeanstalkdResponse | null {
    if (result === null) {
      this.buf = data; // wait for more data

      return null;
    }

    if (result instanceof BeanstalkdResponse) {
      this.buf = empty;
      return result;
    }

    // Got [BeanstalkdResponse, Buffer] tuple

    const [response, remaining] = result;

    this.buf = remaining;

    return response;
  }
}
