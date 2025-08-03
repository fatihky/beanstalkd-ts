import { describe, expect, it } from 'vitest';
import { InsertedResponse, TimedOutResponse } from '../src';
import { BeanstalkdResponseParser } from '../src/response-parser';

describe('response parser', () => {
  it('should parse multiple complete responses in one buffer', () => {
    const parser = new BeanstalkdResponseParser();
    const result = parser.read(Buffer.from('TIMED_OUT\r\nINSERTED 123\r\n'));

    expect(result).toBeInstanceOf(Array);
  });

  it('should parse partial constant responses', () => {
    const parser = new BeanstalkdResponseParser();

    // timedout response is complete, "inserted" response is partially received.
    // inserted response must be buffered and the timedout response must be returned
    expect(parser.read(Buffer.from('TIMED_OUT\r\nINSERTED'))).instanceOf(
      TimedOutResponse,
    );

    // rest of the "inserted" response
    expect(parser.read(Buffer.from(' 123\r\n'))).toBeInstanceOf(
      InsertedResponse,
    );
  });
});
