/**
 * Beanstalkd protocol parser
 * Parses beanstalkd's responses
 */
import {
  BadFormatResponse,
  BeanstalkdResponse,
  BuriedResponse,
  DeadlineSoonResponse,
  DeletedResponse,
  DrainingResponse,
  ExpectedCrlfResponse,
  FoundResponse,
  InsertedResponse,
  InternalErrorResponse,
  JobBuriedResponse,
  JobTooBigResponse,
  NotFoundResponse,
  NotIgnoredResponse,
  OkResponse,
  OutOfMemoryResponse,
  PausedResponse,
  ReleasedResponse,
  ReservedResponse,
  TimedOutResponse,
  UnknownCommandResponse,
  UsingTubeResponse,
  WatchingResponse,
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

    if (bufStartsWith(data, ReservedResponse.prefix))
      return this.handleParseResult(data, ReservedResponse.parse(data));

    // rest of responses are alphabetilcally sorted
    if (bufStartsWith(data, BadFormatResponse.raw))
      return this.handleConstantResponse(data, BadFormatResponse);
    if (bufStartsWith(data, BuriedResponse.raw))
      return this.handleConstantResponse(data, BuriedResponse);
    if (bufStartsWith(data, FoundResponse.prefix))
      return this.handleParseResult(data, FoundResponse.parse(data));
    if (bufStartsWith(data, JobBuriedResponse.prefix))
      return this.handleParseResult(data, JobBuriedResponse.parse(data));
    if (bufStartsWith(data, DeadlineSoonResponse.raw))
      return this.handleConstantResponse(data, DeadlineSoonResponse);
    if (bufStartsWith(data, DrainingResponse.raw))
      return this.handleConstantResponse(data, DrainingResponse);
    if (bufStartsWith(data, DeletedResponse.raw))
      return this.handleConstantResponse(data, DeletedResponse);
    if (bufStartsWith(data, InternalErrorResponse.raw))
      return this.handleConstantResponse(data, InternalErrorResponse);
    if (bufStartsWith(data, ExpectedCrlfResponse.raw))
      return this.handleConstantResponse(data, ExpectedCrlfResponse);
    if (bufStartsWith(data, JobTooBigResponse.raw))
      return this.handleConstantResponse(data, JobTooBigResponse);
    if (bufStartsWith(data, NotFoundResponse.raw))
      return this.handleConstantResponse(data, NotFoundResponse);
    if (bufStartsWith(data, NotIgnoredResponse.raw))
      return this.handleConstantResponse(data, NotIgnoredResponse);
    if (bufStartsWith(data, OutOfMemoryResponse.raw))
      return this.handleConstantResponse(data, OutOfMemoryResponse);
    if (bufStartsWith(data, PausedResponse.raw))
      return this.handleConstantResponse(data, PausedResponse);
    if (bufStartsWith(data, ReleasedResponse.raw))
      return this.handleConstantResponse(data, ReleasedResponse);
    if (bufStartsWith(data, TimedOutResponse.raw))
      return this.handleConstantResponse(data, TimedOutResponse);
    if (bufStartsWith(data, UnknownCommandResponse.raw))
      return this.handleConstantResponse(data, UnknownCommandResponse);
    if (bufStartsWith(data, UsingTubeResponse.prefix))
      return this.handleParseResult(data, UsingTubeResponse.parse(data));
    if (bufStartsWith(data, WatchingResponse.prefix))
      return this.handleParseResult(data, WatchingResponse.parse(data));

    // wait for more data
    this.buf = data;

    return null;
  }

  private handleConstantResponse<T extends BeanstalkdResponse>(
    buf: Buffer,
    cons: (new () => T) & { raw: Buffer },
  ): T | [T, Buffer] {
    if (buf.byteLength === cons.raw.byteLength) {
      return new cons();
    }

    const remaining = buf.subarray(cons.raw.byteLength);

    return [new cons(), remaining];
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
