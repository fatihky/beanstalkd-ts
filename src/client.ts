import { createConnection, type Socket } from 'node:net';
import {
  type BeanstalkdCommand,
  bury,
  del,
  ignore,
  kick,
  kickJob,
  pauseTube,
  peek,
  peekBuried,
  peekDelayed,
  peekReady,
  put,
  type PutParams,
  release,
  reserve,
  reserveJob,
  reserveWithTimeout,
  stats,
  statsJob,
  type StatsResult,
  statsTube,
  use,
  watch,
} from './commands';
import {
  BadFormatError,
  BeanstalkdInternalError,
  DeadlineSoonError,
  JobBuriedError,
  NotFoundError,
  NotIgnoredError,
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
  type FoundResponse,
  type InsertedResponse,
  InternalErrorResponse,
  JobBuriedResponse,
  JobKickedResponse,
  type KickedResponse,
  NotFoundResponse,
  NotIgnoredResponse,
  OutOfMemoryResponse,
  type PausedResponse,
  type ReservedResponse,
  TimedOutResponse,
  UnknownCommandResponse,
  type UsingTubeResponse,
  type WatchingResponse,
} from './responses';
import { JobStats } from './responses/job-stats';
import { TubeStats } from './responses/tube-stats';

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
    if (response instanceof NotIgnoredResponse) return new NotIgnoredError();
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

  /**
   * Ignore/Unwatch a tube
   */
  async ignore(tube: string): Promise<WatchingResponse> {
    return this.runCommand(ignore, tube);
  }

  /**
   * Move `n` "buried" or "delayed" jobs into the "ready" queue.
   *
   * @throws {NotFoundError} if the current tube does not have any "buried" or "delayed" jobs.
   *
   * @description
   * From beanstalkd docs:
   *
   * The kick command applies only to the currently used tube. It moves jobs into
   * the ready queue. If there are any buried jobs, it will only kick buried jobs.
   * Otherwise it will kick delayed jobs.
   */
  async kick(jobCount: number): Promise<KickedResponse> {
    return this.runCommand(kick, jobCount);
  }

  /**
   * Kick/move a specific job into the "ready" queue.
   *
   * From beanstalkd docs:
   *
   * The kick-job command is a variant of kick that operates with a single job
   * identified by its job id. If the given job id exists and is in a buried or
   * delayed state, it will be moved to the ready queue of the the same tube where it
   * currently belongs. The syntax is:
   */
  async kickJob(jobId: number): Promise<JobKickedResponse> {
    return this.runCommand(kickJob, jobId);
  }

  async pauseTube(tube: string, delaySeconds: number): Promise<PausedResponse> {
    return this.runCommand(pauseTube, { tube, delay: delaySeconds });
  }

  /**
   * Peek/inspect a job
   */
  async peek(jobId: number): Promise<FoundResponse> {
    return this.runCommand(peek, jobId);
  }

  /**
   * Peek/inspect a job in "buried" state
   */
  async peekBuried(): Promise<FoundResponse> {
    return await this.runCommand(peekBuried, void 0);
  }

  /**
   * Peek/inspect a job in "delayed" state
   */
  async peekDelayed(): Promise<FoundResponse> {
    return this.runCommand(peekDelayed, void 0);
  }

  /**
   * Peek/inspect a job in "ready" state
   */
  async peekReady(): Promise<FoundResponse> {
    return this.runCommand(peekReady, void 0);
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

  /**
   * Get server statistics
   */
  async stats(): Promise<StatsResult> {
    return this.runCommand(stats, void 0);
  }

  /**
   * Get a job's statistics
   *
   * @throws {NotFoundError} if the job was not found.
   */
  async statsJob(jobId: number): Promise<JobStats> {
    return this.runCommand(statsJob, jobId);
  }

  /**
   * Get a tube's statistics
   *
   * @throws {NotFoundError} if the tube was not found.
   */
  async statsTube(tube: string): Promise<TubeStats> {
    return this.runCommand(statsTube, tube);
  }

  async use(tube: string): Promise<UsingTubeResponse> {
    return this.tubeCommand(use, tube);
  }

  /**
   * Watch a tube
   */
  async watch(tube: string): Promise<WatchingResponse> {
    return this.runCommand(watch, tube);
  }

  private runCommand<A, T>(cmd: BeanstalkdCommand<T, A>, arg: A): Promise<T> {
    const notConnectedError = new Error('Not connected');
    const originalStack = new Error().stack; // preserve the original stack trace

    return new Promise((resolve, reject) => {
      if (!this.connection) return reject(notConnectedError);

      let writeFailed = false;
      const handler: ResponseHandler = (response) => {
        if (writeFailed) return; // already rejected

        if (response instanceof Error) {
          response.stack = [originalStack, response.stack].join('\n');

          reject(response);
        } else {
          resolve(cmd.handle(response));
        }
      };

      this.queue.push(handler);

      this.connection.write(cmd.compose(arg), (err) => {
        if (!err) return;

        writeFailed = true;

        reject(err);
      });
    });
  }

  private tubeCommand<T>(
    cmd: BeanstalkdCommand<T, string>,
    tube: string,
  ): Promise<T> {
    const notConnectedError = new Error('Not connected');

    return new Promise((resolve, reject) => {
      if (!this.connection) return reject(notConnectedError);

      this.queue.push((response) =>
        response instanceof Error
          ? reject(response)
          : resolve(cmd.handle(response)),
      );

      this.connection.write(cmd.compose(tube));
    });
  }
}
