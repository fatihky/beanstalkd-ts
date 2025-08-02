import { describe, expect, it } from 'vitest';
import { put } from '../../src/commands';
import { ExpectedCrlfError } from '../../src/errors/expected-crlf-error';
import { ExpectedCrlfResponse } from '../../src/responses/expected-crlf-response';
import { InsertedResponse } from '../../src/responses/inserted-response';

describe('put command', () => {
  it('should handle inserted response', () => {
    const response = new InsertedResponse(1234);

    expect(put.handle(response)).toBeInstanceOf(InsertedResponse);
  });

  it('should throw ExpectedCrlfError if got ExpectedCrlfResponse', () => {
    expect(() => put.handle(new ExpectedCrlfResponse())).toThrowError(
      ExpectedCrlfError,
    );
  });
});
