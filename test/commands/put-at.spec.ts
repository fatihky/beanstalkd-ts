import { describe, expect, it } from 'vitest';
import { putAt } from '../../src/commands';
import { DrainingError } from '../../src/errors/draining-error';
import { ExpectedCrlfError } from '../../src/errors/expected-crlf-error';
import { JobTooBigError } from '../../src/errors/job-too-big-error';
import { DrainingResponse } from '../../src/responses';
import { ExpectedCrlfResponse } from '../../src/responses/expected-crlf-response';
import { InsertedResponse } from '../../src/responses/inserted-response';
import { JobTooBigResponse } from '../../src/responses/job-too-big-response';

describe('put-at command', () => {
  it('composes "put-at <pri> <unix-ts> <ttr> <bytes>\\r\\n<data>\\r\\n"', () => {
    expect(
      putAt.compose({ pri: 1, unixTs: 12345, ttr: 60, data: 'hi' }).toString(),
    ).toBe('put-at 1 12345 60 2\r\nhi\r\n');
  });

  it('should handle inserted response', () => {
    const response = new InsertedResponse(1234);

    expect(putAt.handle(response)).toBeInstanceOf(InsertedResponse);
  });

  it('should throw DrainingError if got DrainingResponse', () => {
    expect(() => putAt.handle(new DrainingResponse())).toThrowError(
      DrainingError,
    );
  });

  it('should throw ExpectedCrlfError if got ExpectedCrlfResponse', () => {
    expect(() => putAt.handle(new ExpectedCrlfResponse())).toThrowError(
      ExpectedCrlfError,
    );
  });

  it('should throw JobTooBigError if got JobTooBigResponse', () => {
    expect(() => putAt.handle(new JobTooBigResponse())).toThrowError(
      JobTooBigError,
    );
  });
});
