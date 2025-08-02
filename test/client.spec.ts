import { describe, expect, it } from 'vitest';
import { BeanstalkdClient } from '../src/client';
import {
  BadFormatError,
  BeanstalkdInternalError,
  DeadlineSoonError,
  NotFoundError,
  NotIgnoredError,
  OutOfMemoryError,
  TimedOutError,
  UnkownCommandError,
} from '../src/errors';
import {
  BadFormatResponse,
  DeadlineSoonResponse,
  InternalErrorResponse,
  NotFoundResponse,
  NotIgnoredResponse,
  OutOfMemoryResponse,
  TimedOutResponse,
  UnknownCommandResponse,
} from '../src/responses';

describe('beanstalkd client tests', () => {
  it('should handle error responses', () => {
    expect(
      BeanstalkdClient.handleGenericErrorResponse(new BadFormatResponse()),
    ).toBeInstanceOf(BadFormatError);
    expect(
      BeanstalkdClient.handleGenericErrorResponse(new DeadlineSoonResponse()),
    ).toBeInstanceOf(DeadlineSoonError);
    expect(
      BeanstalkdClient.handleGenericErrorResponse(new InternalErrorResponse()),
    ).toBeInstanceOf(BeanstalkdInternalError);
    expect(
      BeanstalkdClient.handleGenericErrorResponse(new NotFoundResponse()),
    ).toBeInstanceOf(NotFoundError);
    expect(
      BeanstalkdClient.handleGenericErrorResponse(new NotIgnoredResponse()),
    ).toBeInstanceOf(NotIgnoredError);
    expect(
      BeanstalkdClient.handleGenericErrorResponse(new OutOfMemoryResponse()),
    ).toBeInstanceOf(OutOfMemoryError);
    expect(
      BeanstalkdClient.handleGenericErrorResponse(new TimedOutResponse()),
    ).toBeInstanceOf(TimedOutError);
    expect(
      BeanstalkdClient.handleGenericErrorResponse(new UnknownCommandResponse()),
    ).toBeInstanceOf(UnkownCommandError);
  });
});
