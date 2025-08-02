import { createConnection, type Socket } from 'node:net';
import {
  type BeanstalkdCommand,
  bury,
  del,
  pauseTube,
  put,
  type PutParams,
  release,
  reserve,
  reserveJob,
  reserveWithTimeout,
  stats,
  type StatsResult,
  use,
} from './commands';
import {
  BadFormatError,
  BeanstalkdInternalError,
  DeadlineSoonError,
  JobBuriedError,
  NotFoundError,
  OutOfMemoryError,
  TimedOutError,
  UnkownCommandError,
} from './errors';
import { BeanstalkdResponseParser } from './response-parser';
import {
  BadFormatResponse,
  type BeanstalkdResponse,
  DeadlineSoonResponse,
  type DeletedResponse,
  type InsertedResponse,
  InternalErrorResponse,
  JobBuriedResponse,
  NotFoundResponse,
  OutOfMemoryResponse,
  type PausedResponse,
  type ReservedResponse,
  TimedOutResponse,
  UnknownCommandResponse,
  type UsingTubeResponse,
} from './responses';

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
    if (response instanceof JobBuriedResponse)
      return new JobBuriedError(response.jobId);
    if (response instanceof NotFoundResponse) return new NotFoundError();
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
   * Bury a job.
   *
   * This command changes the given job's status the BURIED.
   * Jobs will not be resered through `reserve` or `reserve-with-timeout` calls.
   */
  async bury(jobId: number, priority?: number): Promise<DeletedResponse> {
    return this.runCommand(bury, {
      jobId,
      pri: priority ?? this.defaultPriority,
    });
  }

  /**
   * Delete a job
   */
  async deleteJob(jobId: number): Promise<DeletedResponse> {
    return this.runCommand(del, jobId);
  }

  async pauseTube(tube: string, delaySeconds: number): Promise<PausedResponse> {
    return this.runCommand(pauseTube, { tube, delay: delaySeconds });
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
    return this.runCommand(put, {
      data: payload,
      pri: opts?.pri ?? this.defaultPriority,
      delay: opts?.delay ?? this.defaultDelay,
      ttr: opts?.ttr ?? this.defaultTtr,
    });
  }

  /**
   * Release a job
   */
  async release(
    jobId: number,
    priority?: number,
    delaySeconds?: number,
  ): Promise<DeletedResponse> {
    return this.runCommand(release, {
      jobId,
      pri: priority ?? this.defaultPriority,
      delay: delaySeconds ?? this.defaultDelay,
    });
  }

  /**
   * Reserve a job.
   * This command blocks infinitely until a job gets reserved.
   */
  async reserve(): Promise<ReservedResponse> {
    return this.runCommand(reserve, void 0);
  }

  /**
   * Reserve a specific job
   */
  async reserveJob(jobId: number): Promise<ReservedResponse> {
    return this.runCommand(reserveJob, jobId);
  }

  async reserveWithTimeout(timeoutSeconds: number): Promise<ReservedResponse> {
    return this.runCommand(reserveWithTimeout, timeoutSeconds);
  }

  async stats(): Promise<StatsResult> {
    return this.runCommand(stats, void 0);
  }

  async use(tube: string): Promise<UsingTubeResponse> {
    return this.tubeCommand(use, tube);
  }

  private runCommand<A, T>(cmd: BeanstalkdCommand<T, A>, arg: A): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.connection) return reject(new Error('not connected'));

      this.queue.push((response) =>
        response instanceof Error
          ? reject(response)
          : resolve(cmd.handle(response)),
      );

      this.connection.write(cmd.compose(arg));
    });
  }

  private tubeCommand<T>(
    cmd: BeanstalkdCommand<T, string>,
    tube: string,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.connection) return reject(new Error('not connected'));

      this.queue.push((response) =>
        response instanceof Error
          ? reject(response)
          : resolve(cmd.handle(response)),
      );

      this.connection.write(cmd.compose(tube));
    });
  }
}
