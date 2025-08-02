import { describe, expect, it } from 'vitest';
import { BeanstalkdClient } from '../src/client';
import { OutOfMemoryError } from '../src/errors/out-of-memory-error';
import { OutOfMemoryResponse } from '../src/responses/out-of-memory-response';

describe('beanstalkd client tests', () => {
  it('should handle error responses', () => {
    expect(
      BeanstalkdClient.handleGenericErrorResponse(new OutOfMemoryResponse()),
    ).toBeInstanceOf(OutOfMemoryError);
  });
});
