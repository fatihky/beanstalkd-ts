import { describe, expect, it } from 'vitest';
import { release } from '../../src/commands';
import { BuriedError } from '../../src/errors';
import { BuriedResponse } from '../../src/responses';

describe('release command', () => {
  it('should throw error if buried response', () => {
    expect(() => release.handle(new BuriedResponse())).toThrowError(
      BuriedError,
    );
  });
});
