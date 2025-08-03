# Beanstalkd Client with full TypeScript support

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

If you need to handle connection failures, you can use this method:

```ts
client.getConnection(); // returns Socket | null
```

### Features

* **All commands** and their success results are typed. (OkResponse, InsertedResponse etc..)
* **All beanstalkd errors are typed** through specific classes each (NotFoundError, ExpectedCrlfError, etc..)
* Fully unit tested.
* Throws errors with extra call stack (preserves original call stack)

### Non-features
* DOES NOT handle auto-reconnect. Thus you need to handle the "close" event. And issue your `.use`/`.watch`/`.ignore` calls right after the `.connect` call.
  You might want to stop the worker process and let process manager to wait for beanstalkd to become available.

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
