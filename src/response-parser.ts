/**
 * Beanstalkd protocol parser
 * Parses beanstalkd's responses
 */
import {
  BadFormatResponse,
  type BeanstalkdResponse,
  BuriedResponse,
  DeadlineSoonResponse,
  DeletedResponse,
  DrainingResponse,
  ExpectedCrlfResponse,
  FoundResponse,
  InsertedResponse,
  InternalErrorResponse,
  JobBuriedResponse,
  JobKickedResponse,
  JobTooBigResponse,
  KickedResponse,
  NotFoundResponse,
  NotIgnoredResponse,
  OkResponse,
  OutOfMemoryResponse,
  PausedResponse,
  ReleasedResponse,
  ReservedResponse,
  TimedOutResponse,
  TouchedResponse,
  UnknownCommandResponse,
  UsingTubeResponse,
  WatchingResponse,
} from './responses';
import { bufStartsWith } from './utils';

const empty: Buffer<ArrayBufferLike> = Buffer.from('');

export class BeanstalkdResponseParser {
  private buf = empty;

  read(buf: Buffer): BeanstalkdResponse | BeanstalkdResponse[] | null {
    let remaining = this.buf.length > 0 ? Buffer.concat([this.buf, buf]) : buf;
    const responses: BeanstalkdResponse[] = [];

    for (;;) {
      const result = this.parseIncomingBuffer(remaining);

      if (result === null) {
        // wait for more data
        this.buf = remaining;

        return responses.length > 0
          ? responses.length === 1
            ? responses[0]
            : responses
          : null; // stop parsing. need more data
      }

      if (Array.isArray(result)) {
        responses.push(result[0]);

        remaining = result[1];

        continue; // try to parse again
      }

      // extracted a response. no more extra bytes left.
      responses.push(result);
      // reset the buffer
      this.buf = empty;

      return responses.length === 1 ? result : responses;
    }
  }

  private parseIncomingBuffer(
    data: Buffer,
  ): BeanstalkdResponse | [BeanstalkdResponse, Buffer] | null {
    // we expect to receive the OK response most of the time.
    // so first try to parse that, otherwise try the other responses.
    if (bufStartsWith(data, OkResponse.prefix)) return OkResponse.parse(data);

    if (bufStartsWith(data, InsertedResponse.prefix))
      return InsertedResponse.parse(data);

    if (bufStartsWith(data, ReservedResponse.prefix))
      return ReservedResponse.parse(data);

    // rest of responses are alphabetilcally sorted
    if (bufStartsWith(data, BadFormatResponse.raw))
      return this.handleConstantResponse(data, BadFormatResponse);
    if (bufStartsWith(data, BuriedResponse.raw))
      return this.handleConstantResponse(data, BuriedResponse);
    if (bufStartsWith(data, FoundResponse.prefix))
      return FoundResponse.parse(data);
    if (bufStartsWith(data, JobBuriedResponse.prefix))
      return JobBuriedResponse.parse(data);
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
    if (bufStartsWith(data, JobKickedResponse.raw))
      return this.handleConstantResponse(data, JobKickedResponse);
    if (bufStartsWith(data, JobTooBigResponse.raw))
      return this.handleConstantResponse(data, JobTooBigResponse);
    if (bufStartsWith(data, KickedResponse.prefix))
      return KickedResponse.parse(data);
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
    if (bufStartsWith(data, TouchedResponse.raw))
      return this.handleConstantResponse(data, TouchedResponse);
    if (bufStartsWith(data, UnknownCommandResponse.raw))
      return this.handleConstantResponse(data, UnknownCommandResponse);
    if (bufStartsWith(data, UsingTubeResponse.prefix))
      return UsingTubeResponse.parse(data);
    if (bufStartsWith(data, WatchingResponse.prefix))
      return WatchingResponse.parse(data);

    return null;
  }

  private handleConstantResponse<T extends BeanstalkdResponse>(
    buf: Buffer,
    cons: (new () => T) & { raw: Buffer },
  ): T | [T, Buffer] | null {
    if (buf.byteLength === cons.raw.byteLength) {
      return new cons();
    }

    const remaining = buf.subarray(cons.raw.byteLength);

    return [new cons(), remaining];
  }
}
