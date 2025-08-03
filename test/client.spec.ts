import getPort from 'get-port';
import { describe, expect, it } from 'vitest';
import { BeanstalkdClient } from '../src/client';
import {
  BadFormatError,
  BeanstalkdInternalError,
  BuriedError,
  DeadlineSoonError,
  JobBuriedError,
  NotFoundError,
  NotIgnoredError,
  OutOfMemoryError,
  TimedOutError,
  UnkownCommandError,
} from '../src/errors';
import {
  BadFormatResponse,
  BuriedResponse,
  DeadlineSoonResponse,
  InternalErrorResponse,
  NotFoundResponse,
  NotIgnoredResponse,
  OutOfMemoryResponse,
  TimedOutResponse,
  UnknownCommandResponse,
} from '../src/responses';
import { createServer } from 'net';

describe('beanstalkd client tests', () => {
  it('should handle error responses', () => {
    expect(
      BeanstalkdClient.handleGenericErrorResponse(new BadFormatResponse()),
    ).toBeInstanceOf(BadFormatError);
    expect(
      BeanstalkdClient.handleGenericErrorResponse(new BuriedResponse()),
    ).toBeInstanceOf(BuriedError);
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

  /**
   * To test the error handling, I will create a fake beanstalkd server.
   */
  it('should handle all the error responses correctly', async () => {
    const port = await getPort();
    let serverResponse = Buffer.from('OK 13\r\nbeanstalkd-ts\r\n'); // not used..
    const server = createServer((conn) => {
      console.log('handle connection');
      conn.on('data', () => conn.write(serverResponse));
    });

    const client = new BeanstalkdClient({ port });

    try {
      await new Promise<void>((resolve) => server.listen(port, resolve));

      await client.connect();

      // bad format error
      serverResponse = Buffer.from('BAD_FORMAT\r\n');
      await expect(() => client.stats()).rejects.toThrowError(BadFormatError);

      // buried error
      serverResponse = Buffer.from('BURIED\r\n');
      await expect(() => client.stats()).rejects.toThrowError(BuriedError);

      // deadline soon error
      serverResponse = Buffer.from('DEADLINE_SOON\r\n');
      await expect(() => client.stats()).rejects.toThrowError(
        DeadlineSoonError,
      );

      // internal error
      serverResponse = Buffer.from('INTERNAL_ERROR\r\n');
      await expect(() => client.stats()).rejects.toThrowError(
        BeanstalkdInternalError,
      );

      // job buried error
      serverResponse = Buffer.from('BURIED 123\r\n');
      await expect(() => client.stats()).rejects.toThrowError(JobBuriedError);

      // not found error
      serverResponse = Buffer.from('NOT_FOUND\r\n');
      await expect(() => client.stats()).rejects.toThrowError(NotFoundError);

      // not ignored error
      serverResponse = Buffer.from('NOT_IGNORED\r\n');
      await expect(() => client.stats()).rejects.toThrowError(NotIgnoredError);

      // out of memory error
      serverResponse = Buffer.from('OUT_OF_MEMORY\r\n');
      await expect(() => client.stats()).rejects.toThrowError(OutOfMemoryError);

      // timeout error
      serverResponse = Buffer.from('TIMED_OUT\r\n');
      await expect(() => client.stats()).rejects.toThrowError(TimedOutError);

      // unknown command error
      serverResponse = Buffer.from('UNKNOWN_COMMAND\r\n');
      await expect(() => client.stats()).rejects.toThrowError(
        UnkownCommandError,
      );
    } finally {
      await client.close();
      server.close();
    }
  });
});
