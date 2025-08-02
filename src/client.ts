import { createConnection, type Socket } from 'node:net';
import {
  put,
  reserve,
  stats,
  use,
  type PutParams,
  type StatsResult,
} from './commands';
import { DeadlineSoonError, TimedOutError } from './errors';
import { BadFormatError } from './errors/bad-format-error';
import { BeanstalkdInternalError } from './errors/beanstalkd-internal-error';
import { OutOfMemoryError } from './errors/out-of-memory-error';
import { UnkownCommandError } from './errors/unknown-command-error';
import { BeanstalkdResponseParser } from './response-parser';
import {
  DeadlineSoonResponse,
  ReservedResponse,
  TimedOutResponse,
  type BeanstalkdResponse,
  type UsingTubeResponse,
} from './responses';
import { BadFormatResponse } from './responses/bad-format-response';
import type { InsertedResponse } from './responses/inserted-response';
import { InternalErrorResponse } from './responses/internal-error-response';
import { OutOfMemoryResponse } from './responses/out-of-memory-response';
import { UnknownCommandResponse } from './responses/unknown-command-response';

interface BeanstalkdClientParams {
  host?: string;
  port?: number;
}

type ResponseHandler = (response: BeanstalkdResponse | Error) => void;

export class BeanstalkdClient {
  readonly host: string;
  readonly port: number;

  /** default job priority (default: 1024) */
  defaultPriority = 1024;

  /** default put delay in seconds (default: 0) */
  defaultDelay = 0;

  /** default time-to-run value (default: 60 seconds) */
  defaultTtr = 60;

  private connection: Socket | null = null;
  private parser = new BeanstalkdResponseParser();
  /** response handler queue */
  private queue: ResponseHandler[] = [];

  constructor(params?: BeanstalkdClientParams) {
    this.host = params?.host ?? '127.0.0.1';
    this.port = params?.port ?? 11300;
  }

  static handleGenericErrorResponse(
    response: BeanstalkdResponse,
  ): Error | null {
    if (response instanceof BadFormatResponse) return new BadFormatError();
    if (response instanceof DeadlineSoonResponse)
      return new DeadlineSoonError();
    if (response instanceof InternalErrorResponse)
      return new BeanstalkdInternalError();
    if (response instanceof OutOfMemoryResponse) return new OutOfMemoryError();
    if (response instanceof TimedOutResponse) return new TimedOutError();
    if (response instanceof UnknownCommandResponse)
      return new UnkownCommandError();

    return null;
  }

  async connect() {
    if (this.connection) return;

    await new Promise<void>((resolve) => {
      this.connection = createConnection(this.port, this.host, resolve);

      this.connection.on('data', (data) => {
        const result = this.parser.read(data);

        if (result === null) return; // wait for more data

        const handler = this.queue.shift();

        if (!handler) throw new Error('Got a response but no handlers found');

        handler(BeanstalkdClient.handleGenericErrorResponse(result) ?? result);
      });
    });
  }

  async close() {
    await new Promise<void>((resolve) => {
      if (!this.connection || this.connection.destroyed) return;

      this.connection.end(resolve);
    });
  }

  /**
   * put a job into the beanstalkd
   *
   * Might throw these errors:
   * - ExpectedCrlfError
   * - BeanstalkdInvalidResponseError: got an invalid response
   */
  async put(
    payload: string,
    opts?: Partial<Omit<PutParams, 'data'>>,
  ): Promise<InsertedResponse> {
    return new Promise((resolve, reject) => {
      if (!this.connection) return reject(new Error('not connected'));

      this.queue.push((response) =>
        response instanceof Error
          ? reject(response)
          : resolve(put.handle(response)),
      );

      this.connection.write(
        put.compose({
          data: payload,
          pri: opts?.pri ?? this.defaultPriority,
          delay: opts?.delay ?? this.defaultDelay,
          ttr: opts?.ttr ?? this.defaultTtr,
        }),
      );
    });
  }

  async reserve(): Promise<ReservedResponse> {
    return new Promise((resolve, reject) => {
      if (!this.connection) return reject(new Error('not connected'));

      this.queue.push((response) =>
        response instanceof Error
          ? reject(response)
          : resolve(reserve.handle(response)),
      );

      this.connection.write(reserve.compose());
    });
  }

  async stats(): Promise<StatsResult> {
    return new Promise((resolve, reject) => {
      if (!this.connection) return reject(new Error('not connected'));

      this.queue.push((response) =>
        response instanceof Error
          ? reject(response)
          : resolve(stats.handle(response)),
      );

      this.connection.write(stats.compose());
    });
  }

  async use(tube: string): Promise<UsingTubeResponse> {
    return new Promise((resolve, reject) => {
      if (!this.connection) return reject(new Error('not connected'));

      this.queue.push((response) =>
        response instanceof Error
          ? reject(response)
          : resolve(use.handle(response)),
      );

      this.connection.write(use.compose(tube));
    });
  }
}
