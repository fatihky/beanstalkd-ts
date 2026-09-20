# Beanstalkd Client with full TypeScript support

**STATUS**: **BETA**. This library is still under heavy development. Do not use in production.

Installation:

```sh
npm install beanstalkd-ts
```

Usage:

```ts
import { BeanstalkdClient } from 'beanstalkd-ts'

const client = new BeanstalkdClient()

await client.connect()

await client.put("some payload")

const result = await client.reserveWithTimeout(10);

await client.deleteJob(result.jobId)
```

For the list of available commands, refer to the official beanstalkd manual: https://raw.githubusercontent.com/beanstalkd/beanstalkd/master/doc/protocol.txt

By default, `connect()` and reconnection after an unexpected disconnect both retry
automatically with exponential backoff (starting at 200ms, capped at 10s, retrying
forever). Configure or disable this via the `retry` option:

```ts
const client = new BeanstalkdClient({
  retry: {
    initialDelayMs: 200,   // delay before the first retry (default: 200)
    maxDelayMs: 10_000,    // upper bound for the delay (default: 10_000)
    factor: 2,             // backoff multiplier (default: 2)
    maxRetries: Infinity,  // give up after this many attempts (default: Infinity)
  },
  onReconnecting: (attempt, delayMs, error) => console.warn('retrying connection', attempt, delayMs, error),
  onReconnected: () => console.log('reconnected'),
  onReconnectFailed: (error) => console.error('giving up reconnecting', error),
});

// or disable it entirely and handle it yourself:
const client = new BeanstalkdClient({ retry: false });
```

While a reconnect is in progress, in-flight commands from before the disconnect are
rejected (they'll never get their response); new command calls made during/after a
reconnect wait for it to finish and are sent once reconnected.

If you need to handle connection events directly, you can use this method. Note that
auto-reconnect replaces the underlying connection instance on every reconnect, so a
reference obtained here can go stale after an unexpected disconnect.

```ts
client.getConnection(); // returns Socket | null
```

#### Example worker with reserve timeout handling

```ts
import { BeanstalkdClient, BeanstalkdJob, TimedOutError } from 'beanstalkd-ts'

const client = new BeanstalkdClient();

for (;;) {
  try {
    const job: BeanstalkdJob = await this.bsClient.reserveWithTimeout(10);

    // process job...
    console.log('process job:', job.id, job.payload.toString())

    // remove from the queue
    await client.deleteJob(job.id)
  } catch (err) {
    if (err instanceof TimedOutError) {
      continue; // could not reserve a job in 10 seconds. retry again.
    }

    // rethrow the original error
    throw err;
  }
}
```

### beanstalkd-pi support

This client also works against [beanstalkd-pi](https://github.com/fatihky/beanstalkd-pi), a
wire-compatible reimplementation of beanstalkd that adds thirteen extension commands with no stock
equivalent. Since these commands don't exist against stock beanstalkd, feature-detect them with
`detectCapabilities()` (returns `null`, instead of throwing, when the server doesn't recognize the
"capabilities" command) before relying on them:

```ts
const capabilities = await client.detectCapabilities();

if (capabilities?.supports('put-at')) {
  await client.putAt('some payload', Math.floor(Date.UTC(2030, 0, 1) / 1000));
}
```

The extension commands:

```ts
await client.ping(); // liveness check

// "put" with an absolute Unix timestamp instead of a relative delay
await client.putAt('some payload', unixTs, { pri: 1024, ttr: 60 });

// "kick"/"peek-ready"/"peek-delayed"/"peek-buried" against an explicit tube,
// instead of the connection's currently used tube
await client.kickTube('some-tube', 10);
await client.peekTube('some-tube', 'ready'); // or 'delayed' / 'buried'

// delete every ready/delayed/buried job in a tube outright
await client.deleteTube('some-tube');

// configure automatic dead-letter routing for a tube (0 disables it again)
await client.setDlq('some-tube', 3, 'some-tube-dead');

// connection introspection, with no stock equivalent at all
await client.statsConn(); // the calling connection
await client.statsConn(someConnectionId);
await client.listConnections();

// a bounded, non-destructive listing of a tube's jobs (limit defaults to 100, capped at 10000)
await client.listJobs('some-tube', 'ready', 50); // or 'delayed' / 'buried'

// names of every currently paused tube
await client.listTubesPaused();

// `statsTube()`'s fields for every tube, in one call
await client.statsTubeAll();

// turn drain mode on/off, or just report its current state (resolves to the state after running)
await client.drain('on');
await client.drain('off');
await client.drain(); // 'status' is the default; never changes drain mode
```

`ServerStats`, `TubeStats`, and `JobStats` also gain a few extra fields when talking to
beanstalkd-pi (extension command counters, dead-letter routing state); they read as `0`/`""`
against stock beanstalkd.

### Features

* **All commands** and their success results are typed. (OkResponse, InsertedResponse etc..)
* **All beanstalkd errors are typed** through specific classes each (NotFoundError, ExpectedCrlfError, etc..)
* Fully unit tested.
* Throws errors with extra call stack (preserves original call stack)

### Non-features
* Auto-reconnect does not replay in-flight commands. Any command that was pending when the
  connection dropped is rejected; issue your `.use`/`.watch`/`.ignore` calls again after the
  reconnect if they're needed for subsequent commands (e.g. in `onReconnected`).

### Statistics

#### Server Stats

```ts
await client.stats()
```

```ts
export class ServerStats {
  readonly binlogCurrentIndex: number;
  readonly binlogMaxSize: number;
  readonly binlogOldestIndex: number;
  readonly bingloRecordsMigrated: number;
  readonly binlogRecordsWritten: number;
  readonly cmdBury: number;
  readonly cmdDelete: number;
  readonly cmdIgnore: number;
  readonly cmdKick: number;
  readonly cmdListTubeUsed: number;
  readonly cmdListTubesWatched: number;
  readonly cmdListTubes: number;
  readonly cmdPauseTube: number;
  readonly cmdPeekBuried: number;
  readonly cmdPeekDelayed: number;
  readonly cmdPeekReady: number;
  readonly cmdPeek: number;
  readonly cmdPut: number;
  readonly cmdRelease: number;
  readonly cmdReserveWithTimeout: number;
  readonly cmdReserve: number;
  readonly cmdStatsJob: number;
  readonly cmdStatsTube: number;
  readonly cmdStats: number;
  readonly cmdTouch: number;
  readonly cmdUse: number;
  readonly cmdWatch: number;
  readonly currentConnections: number;
  readonly currentJobsBuried: number;
  readonly currentJobsDelayed: number;
  readonly currentJobsReady: number;
  readonly currentJobsReserved: number;
  readonly currentJobsUrgent: number;
  readonly currentProducers: number;
  readonly currentTubes: number;
  readonly currentWaiting: number;
  readonly currentWorkers: number;
  readonly draining: string;
  readonly hostname: string;
  readonly id: string;
  readonly jobTimeouts: number;
  readonly maxJobSize: number;
  readonly os: string;
  readonly pid: number;
  readonly platform: string;
  readonly rusageStime: number;
  readonly rusageUtime: number;
  readonly totalConnections: number;
  readonly totalJobs: number;
  readonly uptime: number;
  readonly version: string;
}
```

#### Tube Stats

```ts
await client.statsTube('tube-name')
```

```ts
export class TubeStats {
  readonly name: string;

  readonly cmdDelete: number;
  readonly cmdPauseTube: number;
  readonly currentJobsBuried: number;
  readonly currentJobsDelayed: number;
  readonly currentJobsReady: number;
  readonly currentJobsReserved: number;
  readonly currentJobsUrgent: number;
  readonly currentUsing: number;
  readonly currentWaiting: number;
  readonly currentWatching: number;
  readonly pause: number;
  readonly pauseTimeLeft: number;
  readonly totalJobs: number;
}
```

#### Job Stats

```ts
await client.statsJob(123)
```

```ts
export class JobStats {
  readonly id: number;
  readonly tube: string;
  readonly state: string;

  readonly age: number;
  readonly buries: number;
  readonly delay: number;
  readonly file: number;
  readonly kicks: number;
  readonly pri: number;
  readonly releases: number;
  readonly reserves: number;
  readonly timeLeft: number;
  readonly timeouts: number;
  readonly ttr: number;
}
```
