import { describe, expect, it } from 'vitest';
import { put } from '../../src/commands';
import { BuriedError } from '../../src/errors/buried-error';
import { ExpectedCrlfError } from '../../src/errors/expected-crlf-error';
import { BuriedResponse } from '../../src/responses/buried-response';
import { ExpectedCrlfResponse } from '../../src/responses/expected-crlf-response';
import { InsertedResponse } from '../../src/responses/inserted-response';
import { JobTooBigError } from '../../src/errors/job-too-big-error';
import { JobTooBigResponse } from '../../src/responses/job-too-big-response';

describe('put command', () => {
  it('should handle inserted response', () => {
    const response = new InsertedResponse(1234);

    expect(put.handle(response)).toBeInstanceOf(InsertedResponse);
  });

  it('should throw BuriedError if got BuriedResponse', () => {
    expect(() => put.handle(new BuriedResponse(1234))).toThrowError(
      BuriedError,
    );
  });

  it('should throw ExpectedCrlfError if got ExpectedCrlfResponse', () => {
    expect(() => put.handle(new ExpectedCrlfResponse())).toThrowError(
      ExpectedCrlfError,
    );
  });

  it('should throw JobTooBigError if got JobTooBigResponse', () => {
    expect(() => put.handle(new JobTooBigResponse())).toThrowError(
      JobTooBigError,
    );
  });
});
