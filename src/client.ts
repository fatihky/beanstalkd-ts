import { createConnection, type Socket } from 'node:net';
import {
  type BeanstalkdCommand,
  bury,
  capabilities,
  del,
  deleteTube,
  ignore,
  kick,
  kickJob,
  kickTube,
  listConnections,
  listTubes,
  listTubesWatched,
  listTubeUsed,
  type PeekTubeState,
  type PutAtParams,
  type PutParams,
  pauseTube,
  peek,
  peekBuried,
  peekDelayed,
  peekReady,
  peekTube,
  ping,
  put,
  putAt,
  release,
  reserve,
  reserveJob,
  reserveWithTimeout,
  setDlq,
  stats,
  statsConn,
  statsJob,
  statsTube,
  touch,
  use,
  watch,
} from './commands';
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
} from './errors';
import { BeanstalkdError } from './errors/beanstalkd-error';
import { BeanstalkdResponseParser } from './response-parser';
import {
  BadFormatResponse,
  type BeanstalkdJob,
  type BeanstalkdResponse,
  BuriedResponse,
  type Capabilities,
  type ConnectionStats,
  DeadlineSoonResponse,
  type DeletedResponse,
  type FoundResponse,
  type InsertedResponse,
  InternalErrorResponse,
  JobBuriedResponse,
  type JobKickedResponse,
  type JobStats,
  type KickedResponse,
  NotFoundResponse,
  NotIgnoredResponse,
  OutOfMemoryResponse,
  type PausedResponse,
  type ServerStats,
  TimedOutResponse,
  type TouchedResponse,
  type TubeDeletedResponse,
  type TubeStats,
  UnknownCommandResponse,
  type UsingTubeResponse,
  type WatchingResponse,
} from './responses';

export interface RetryOptions {
  /** whether to automatically retry on connection failures (default: true) */
  enabled?: boolean;
  /** delay before the first retry attempt, in milliseconds (default: 200) */
  initialDelayMs?: number;
  /** upper bound for the retry delay, in milliseconds (default: 10_000) */
  maxDelayMs?: number;
  /** multiplier applied to the delay after each failed attempt (default: 2) */
  factor?: number;
  /** maximum number of retry attempts. use `Infinity` to retry forever (default: Infinity) */
  maxRetries?: number;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  enabled: true,
  initialDelayMs: 200,
  maxDelayMs: 10_000,
  factor: 2,
  maxRetries: Number.POSITIVE_INFINITY,
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface BeanstalkdClientParams {
  host?: string;
  port?: number;
  /**
   * Configure automatic retry on connection failures (both the initial `connect()`
   * and reconnecting after an unexpected disconnect). Pass `false` to disable entirely
   * and restore the old "fail fast, caller handles it" behavior.
   *
   * Defaults to exponential backoff, retrying forever.
   */
  retry?: boolean | RetryOptions;
  /** called before each retry attempt, after a connection failure */
  onReconnecting?: (attempt: number, delayMs: number, error: Error) => void;
  /** called after successfully reconnecting following an unexpected disconnect */
  onReconnected?: () => void;
  /** called when auto-reconnect gives up after exhausting `retry.maxRetries` */
  onReconnectFailed?: (error: Error) => void;
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

  private readonly retryOptions: Required<RetryOptions>;
  private readonly onReconnecting?: BeanstalkdClientParams['onReconnecting'];
  private readonly onReconnected?: BeanstalkdClientParams['onReconnected'];
  private readonly onReconnectFailed?: BeanstalkdClientParams['onReconnectFailed'];
  /** true once `close()`/`quit()` was called, so we don't try to auto-reconnect afterwards */
  private manualClose = false;
  /** the in-flight connect/reconnect attempt (including its retries), if any */
  private connectingPromise: Promise<void> | null = null;

  constructor(params?: BeanstalkdClientParams) {
    this.host = params?.host ?? '127.0.0.1';
    this.port = params?.port ?? 11300;

    const retry = params?.retry;
    this.retryOptions = {
      ...DEFAULT_RETRY_OPTIONS,
      ...(typeof retry === 'object' ? retry : undefined),
      enabled:
        typeof retry === 'boolean'
          ? retry
          : (retry?.enabled ?? DEFAULT_RETRY_OPTIONS.enabled),
    };
    this.onReconnecting = params?.onReconnecting;
    this.onReconnected = params?.onReconnected;
    this.onReconnectFailed = params?.onReconnectFailed;
  }

  static handleGenericErrorResponse(
    response: BeanstalkdResponse,
  ): Error | null {
    if (response instanceof BadFormatResponse) return new BadFormatError();
    if (response instanceof BuriedResponse) return new BuriedError();
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

  /**
   * Connect to beanstalkd.
   *
   * If `retry` is enabled (the default), this retries with exponential backoff until
   * it connects, `retry.maxRetries` is exhausted (in which case it throws), or `close()`
   * is called while it's retrying.
   */
  async connect() {
    if (this.connection) return;

    this.manualClose = false;

    await (this.connectingPromise ?? this.beginConnecting());
  }

  /**
   * If you need to handle connection events directly, you can get the underlying
   * connection instance through this command. Note that auto-reconnect (see the
   * `retry` constructor option) replaces the connection instance on every reconnect,
   * so a reference obtained here can go stale after an unexpected disconnect.
   */
  getConnection(): Socket | null {
    return this.connection;
  }

  async close() {
    this.manualClose = true;

    await new Promise<void>((resolve) => {
      if (!this.connection || this.connection.destroyed) return resolve();

      this.connection.end(() => resolve());
    });

    this.connection = null;
  }

  /** kicks off a connect/reconnect attempt (with retries) and tracks it as `connectingPromise` */
  private beginConnecting(): Promise<void> {
    const promise = this.connectWithRetry();

    this.connectingPromise = promise;

    // Always settle successfully so this branch never produces an unhandled rejection.
    // Callers that need the outcome await `promise`/`this.connectingPromise` directly.
    promise.then(
      () => {
        if (this.connectingPromise === promise) this.connectingPromise = null;
      },
      (err) => {
        if (this.connectingPromise === promise) this.connectingPromise = null;

        this.onReconnectFailed?.(err);
      },
    );

    return promise;
  }

  private async connectWithRetry(): Promise<void> {
    let attempt = 0;

    for (;;) {
      if (this.manualClose) throw new Error('Connection closed by client');

      try {
        await this.establishConnection();

        return;
      } catch (err) {
        attempt++;

        if (
          !this.retryOptions.enabled ||
          attempt > this.retryOptions.maxRetries
        ) {
          throw err;
        }

        const delay = Math.min(
          this.retryOptions.initialDelayMs *
            this.retryOptions.factor ** (attempt - 1),
          this.retryOptions.maxDelayMs,
        );

        this.onReconnecting?.(attempt, delay, err as Error);

        await sleep(delay);
      }
    }
  }

  /** open a single TCP connection attempt and wire it up; rejects on connection failure */
  private establishConnection(): Promise<void> {
    const handle = (result: BeanstalkdResponse) => {
      const handler = this.queue.shift();

      if (!handler) throw new Error('Got a response but no handlers found');

      handler(BeanstalkdClient.handleGenericErrorResponse(result) ?? result);
    };

    return new Promise<void>((resolve, reject) => {
      let settled = false;
      const socket = createConnection(this.port, this.host);

      socket.once('connect', () => {
        settled = true;
        this.connection = socket;
        resolve();
      });

      // an 'error' listener is required so a connection failure doesn't crash the
      // process; the actual handling happens in the 'close' listener below, which
      // always follows 'error' for a net.Socket.
      socket.on('error', () => {});

      socket.once('close', () => {
        if (!settled) {
          settled = true;
          reject(new Error(`Failed to connect to ${this.host}:${this.port}`));
          return;
        }

        this.handleUnexpectedClose(socket);
      });

      socket.on('data', (data) => {
        const results = this.parser.read(data);

        if (results === null) return; // wait for more data

        if (!Array.isArray(results)) return handle(results);

        results.forEach(handle);
      });
    });
  }

  /** called when a previously-established connection closes without us asking for it */
  private handleUnexpectedClose(socket: Socket) {
    if (this.connection !== socket) return; // stale socket, already superseded

    this.connection = null;

    // these handlers will never get a response now; fail them instead of hanging forever
    const pending = this.queue.splice(0, this.queue.length);
    const err = new Error('Connection closed unexpectedly');

    for (const handler of pending) handler(err);

    if (this.manualClose || !this.retryOptions.enabled) return;

    // failure is reported via onReconnectFailed inside beginConnecting()
    this.beginConnecting().then(
      () => this.onReconnected?.(),
      () => {},
    );
  }

  /** wait out any in-flight (re)connect attempt; throws if there's no connection afterwards */
  private async ensureConnected(): Promise<void> {
    if (this.connection) return;

    if (this.connectingPromise) {
      await this.connectingPromise.catch(() => {});
    }

    if (!this.connection) throw new Error('Not connected');
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
   * beanstalkd-pi extension: discover what the connected server supports
   * (version, max job size/tube name length, and which extension commands
   * it recognizes) instead of hardcoding limits or probing commands one at
   * a time.
   *
   * @throws {UnkownCommandError} against a server with no "capabilities"
   * command, e.g. stock beanstalkd. Prefer `detectCapabilities()` if you'd
   * rather get `null` back than handle that yourself.
   */
  async capabilities(): Promise<Capabilities> {
    return this.runCommand(capabilities, void 0);
  }

  /**
   * Like `capabilities()`, but returns `null` instead of throwing when the
   * server doesn't understand the "capabilities" command (e.g. stock
   * beanstalkd, or a beanstalkd-pi build predating this command) — handy for
   * feature-detecting beanstalkd-pi extensions up front.
   */
  async detectCapabilities(): Promise<Capabilities | null> {
    try {
      return await this.capabilities();
    } catch (err) {
      if (err instanceof UnkownCommandError) return null;

      throw err;
    }
  }

  /**
   * Delete a job
   */
  async deleteJob(jobId: number): Promise<DeletedResponse> {
    return this.runCommand(del, jobId);
  }

  /**
   * beanstalkd-pi extension: delete every ready, delayed, and buried job in
   * `tube` outright, without reserving+deleting each individually. A job
   * still reserved by another connection is left alone and deleted once
   * that connection is done with it.
   *
   * @throws {NotFoundError} if the tube does not exist.
   */
  async deleteTube(tube: string): Promise<TubeDeletedResponse> {
    return this.runCommand(deleteTube, tube);
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

  /**
   * beanstalkd-pi extension: "kick" restricted to an explicit tube instead
   * of the connection's currently used tube.
   *
   * @throws {NotFoundError} if the named tube does not exist.
   */
  async kickTube(tube: string, bound: number): Promise<KickedResponse> {
    return this.runCommand(kickTube, { tube, bound });
  }

  /**
   * beanstalkd-pi extension: the same fields as `statsConn()`, for every
   * currently connected client.
   */
  async listConnections(): Promise<ConnectionStats[]> {
    return this.runCommand(listConnections, void 0);
  }

  /** list all beanstalkd tubes */
  async listTubes(): Promise<string[]> {
    return this.runCommand(listTubes, void 0);
  }

  /** list watched beanstalkd tubes */
  async listTubesWatched(): Promise<string[]> {
    return this.runCommand(listTubesWatched, void 0);
  }

  /** get the tube name currently used */
  async listTubeUsed(): Promise<UsingTubeResponse> {
    return this.runCommand(listTubeUsed, void 0);
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
   * beanstalkd-pi extension: "peek-ready"/"peek-delayed"/"peek-buried"
   * restricted to an explicit tube instead of the connection's currently
   * used tube.
   *
   * @throws {NotFoundError} if the tube does not exist, or exists but has no
   * job in the requested state.
   */
  async peekTube(tube: string, state: PeekTubeState): Promise<FoundResponse> {
    return this.runCommand(peekTube, { tube, state });
  }

  /**
   * beanstalkd-pi extension: a bare liveness check.
   */
  async ping(): Promise<void> {
    return this.runCommand(ping, void 0);
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
   * beanstalkd-pi extension: "put" with an absolute schedule time instead of
   * a relative delay — the job becomes ready at `unixTs` (seconds since the
   * Unix epoch, UTC) rather than `delay` seconds from now.
   *
   * Might throw the same errors as `put()`.
   */
  async putAt(
    payload: string,
    unixTs: number,
    opts?: Partial<Omit<PutAtParams, 'data' | 'unixTs'>>,
  ): Promise<InsertedResponse> {
    return this.runCommand(putAt, {
      data: payload,
      unixTs,
      pri: opts?.pri ?? this.defaultPriority,
      ttr: opts?.ttr ?? this.defaultTtr,
    });
  }

  /**
   * send "quit" command to the beanstalkd server.
   * the server will close our connection.
   */
  async quit() {
    this.manualClose = true;

    await new Promise((resolve, reject) => {
      if (!this.connection) throw new Error('not connected');

      this.connection.once('close', () => {
        this.connection = null;
        resolve(undefined);
      });

      this.connection.write(Buffer.from('quit\r\n'), (err) => {
        if (err) {
          reject(err);
        }
      });
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
  async reserve(): Promise<BeanstalkdJob> {
    return this.runCommand(reserve, void 0);
  }

  /**
   * Reserve a specific job
   */
  async reserveJob(jobId: number): Promise<BeanstalkdJob> {
    return this.runCommand(reserveJob, jobId);
  }

  async reserveWithTimeout(timeoutSeconds: number): Promise<BeanstalkdJob> {
    return this.runCommand(reserveWithTimeout, timeoutSeconds);
  }

  /**
   * beanstalkd-pi extension: configures automatic dead-letter routing for a
   * tube. `tube` is created if missing, like "use"; `deadTube` is not, and
   * only needs to exist once a job is actually routed into it. Pass
   * `maxAttempts: 0` to disable dead-letter routing for `tube` again.
   */
  async setDlq(
    tube: string,
    maxAttempts: number,
    deadTube: string,
  ): Promise<void> {
    return this.runCommand(setDlq, { tube, maxAttempts, deadTube });
  }

  /**
   * Get server statistics
   */
  async stats(): Promise<ServerStats> {
    return this.runCommand(stats, void 0);
  }

  /**
   * beanstalkd-pi extension: introspection stats about a connection. With no
   * `id`, reports on the calling connection itself; with `id`, reports on
   * the connection with that id (matching a `list-connections`/`stats-conn`
   * entry's `id` field) instead.
   *
   * @throws {NotFoundError} if `id` is given and no such connection exists.
   */
  async statsConn(id?: number): Promise<ConnectionStats> {
    return this.runCommand(statsConn, id);
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

  /**
   * Touch a job
   *
   * Beanstalkd reference:
   *
   * The "touch" command allows a worker to request more time to work on a job.
   * This is useful for jobs that potentially take a long time, but you still want
   * the benefits of a TTR pulling a job away from an unresponsive worker.  A worker
   * may periodically tell the server that it's still alive and processing a job
   * (e.g. it may do this on DEADLINE_SOON). The command postpones the auto
   * release of a reserved job until TTR seconds from when the command is issued.
   *
   * @throws {NotFoundError} if the job was not found.
   */
  async touch(jobId: number): Promise<TouchedResponse> {
    return this.runCommand(touch, jobId);
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

  private async runCommand<A, T>(
    cmd: BeanstalkdCommand<T, A>,
    arg: A,
  ): Promise<T> {
    const originalStack = new Error().stack; // preserve the original stack trace

    await this.ensureConnected();

    return new Promise((resolve, reject) => {
      if (!this.connection) return reject(new Error('Not connected'));

      let writeFailed = false;
      const handler: ResponseHandler = (response) => {
        if (writeFailed) return; // already rejected

        if (response instanceof Error || response instanceof BeanstalkdError) {
          response.stack = [originalStack, response.stack].join('\n');

          reject(response);
          return;
        }

        // `cmd.handle()` can throw (e.g. a malformed/unexpected payload); without
        // this try/catch that exception would escape the socket's 'data' handler
        // uncaught, and this promise would never settle instead of rejecting.
        try {
          resolve(cmd.handle(response));
        } catch (err) {
          reject(err);
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

  private async tubeCommand<T>(
    cmd: BeanstalkdCommand<T, string>,
    tube: string,
  ): Promise<T> {
    await this.ensureConnected();

    return new Promise((resolve, reject) => {
      if (!this.connection) return reject(new Error('Not connected'));

      this.queue.push((response) => {
        if (response instanceof Error) {
          reject(response);
          return;
        }

        // see the equivalent try/catch in `runCommand` for why this is needed.
        try {
          resolve(cmd.handle(response));
        } catch (err) {
          reject(err);
        }
      });

      this.connection.write(cmd.compose(tube));
    });
  }
}
