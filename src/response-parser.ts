/**
 * Beanstalkd protocol parser
 * Parses beanstalkd's responses
 */
import {
  BadFormatResponse,
  BeanstalkdResponse,
  BuriedResponse,
  DeadlineSoonResponse,
  DrainingResponse,
  ExpectedCrlfResponse,
  InsertedResponse,
  InternalErrorResponse,
  JobTooBigResponse,
  OkResponse,
  OutOfMemoryResponse,
  TimedOutResponse,
  UnknownCommandResponse,
  UsingTubeResponse,
} from './responses';
import { bufStartsWith } from './utils';

const empty: Buffer<ArrayBufferLike> = Buffer.from('');

export class BeanstalkdResponseParser {
  private buf = empty;

  read(buf: Buffer): BeanstalkdResponse | null {
    const data = this.buf.length > 0 ? Buffer.concat([this.buf, buf]) : buf;

    // we expect to receive the OK response most of the time.
    // so first try to parse that, otherwise try the other responses.
    if (bufStartsWith(data, OkResponse.prefix))
      return this.handleParseResult(data, OkResponse.parse(data));

    if (bufStartsWith(data, InsertedResponse.prefix))
      return this.handleParseResult(data, InsertedResponse.parse(data));

    if (bufStartsWith(data, BuriedResponse.prefix))
      return this.handleParseResult(data, BuriedResponse.parse(data));

    // rest of responses are alphabetilcally sorted
    if (bufStartsWith(data, BadFormatResponse.prefix))
      return this.handleParseResult(data, BadFormatResponse.parse(data));
    if (bufStartsWith(data, DeadlineSoonResponse.prefix))
      return this.handleParseResult(data, DeadlineSoonResponse.parse(data));
    if (bufStartsWith(data, DrainingResponse.prefix))
      return this.handleParseResult(data, DrainingResponse.parse(data));
    if (bufStartsWith(data, InternalErrorResponse.prefix))
      return this.handleParseResult(data, InternalErrorResponse.parse(data));
    if (bufStartsWith(data, ExpectedCrlfResponse.prefix))
      return this.handleParseResult(data, ExpectedCrlfResponse.parse(data));
    if (bufStartsWith(data, JobTooBigResponse.prefix))
      return this.handleParseResult(data, JobTooBigResponse.parse(data));
    if (bufStartsWith(data, OutOfMemoryResponse.prefix))
      return this.handleParseResult(data, OutOfMemoryResponse.parse(data));
    if (bufStartsWith(data, TimedOutResponse.prefix))
      return this.handleParseResult(data, TimedOutResponse.parse(data));
    if (bufStartsWith(data, UnknownCommandResponse.prefix))
      return this.handleParseResult(data, UnknownCommandResponse.parse(data));
    if (bufStartsWith(data, UsingTubeResponse.prefix))
      return this.handleParseResult(data, UsingTubeResponse.parse(data));

    // wait for more data
    this.buf = data;

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
