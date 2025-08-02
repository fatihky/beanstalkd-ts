import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import { type BeanstalkdResponse, BeanstalkdResponseOk } from '../responses';
import { crlf } from '../utils';
import { BeanstalkdCommand } from './command';

const cmd = Buffer.concat([Buffer.from('stats'), crlf]);

export class StatsResult {
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

  constructor(payload: string) {
    const stats = Object.fromEntries(
      payload
        .trim()
        .split('\n')
        .slice(1) // ignore header line ("---") see https://github.com/beanstalkd/beanstalkd/blob/master/prot.c#L140
        .map((line) => {
          const [key, value] = line.split(':');

          return [key, value.trim()];
        }),
    );

    this.binlogCurrentIndex = this.readNumber(stats, 'binlog-current-index');
    this.binlogMaxSize = this.readNumber(stats, 'binlog-max-size');
    this.binlogOldestIndex = this.readNumber(stats, 'binlog-oldest-index');
    this.bingloRecordsMigrated = this.readNumber(
      stats,
      'binlog-records-migrated',
    );
    this.binlogRecordsWritten = this.readNumber(
      stats,
      'binlog-records-written',
    );
    this.cmdBury = this.readNumber(stats, 'cmd-bury');
    this.cmdDelete = this.readNumber(stats, 'cmd-delete');
    this.cmdIgnore = this.readNumber(stats, 'cmd-ignore');
    this.cmdKick = this.readNumber(stats, 'cmd-kick');
    this.cmdListTubeUsed = this.readNumber(stats, 'cmd-list-tube-used');
    this.cmdListTubesWatched = this.readNumber(stats, 'cmd-list-tubes-watched');
    this.cmdListTubes = this.readNumber(stats, 'cmd-list-tubes');
    this.cmdPauseTube = this.readNumber(stats, 'cmd-pause-tube');
    this.cmdPeekBuried = this.readNumber(stats, 'cmd-peek-buried');
    this.cmdPeekDelayed = this.readNumber(stats, 'cmd-peek-delayed');
    this.cmdPeekReady = this.readNumber(stats, 'cmd-peek-ready');
    this.cmdPeek = this.readNumber(stats, 'cmd-peek');
    this.cmdPut = this.readNumber(stats, 'cmd-put');
    this.cmdRelease = this.readNumber(stats, 'cmd-release');
    this.cmdReserveWithTimeout = this.readNumber(
      stats,
      'cmd-reserve-with-timeout',
    );
    this.cmdReserve = this.readNumber(stats, 'cmd-reserve');
    this.cmdStatsJob = this.readNumber(stats, 'cmd-stats-job');
    this.cmdStatsTube = this.readNumber(stats, 'cmd-stats-tube');
    this.cmdStats = this.readNumber(stats, 'cmd-stats');
    this.cmdTouch = this.readNumber(stats, 'cmd-touch');
    this.cmdUse = this.readNumber(stats, 'cmd-use');
    this.cmdWatch = this.readNumber(stats, 'cmd-watch');
    this.currentConnections = this.readNumber(stats, 'current-connections');
    this.currentJobsBuried = this.readNumber(stats, 'current-jobs-buried');
    this.currentJobsDelayed = this.readNumber(stats, 'current-jobs-delayed');
    this.currentJobsReady = this.readNumber(stats, 'current-jobs-ready');
    this.currentJobsReserved = this.readNumber(stats, 'current-jobs-reserved');
    this.currentJobsUrgent = this.readNumber(stats, 'current-jobs-urgent');
    this.currentProducers = this.readNumber(stats, 'current-producers');
    this.currentTubes = this.readNumber(stats, 'current-tubes');
    this.currentWaiting = this.readNumber(stats, 'current-waiting');
    this.currentWorkers = this.readNumber(stats, 'current-workers');
    this.draining = this.readString(stats, 'draining');
    this.hostname = this.readString(stats, 'hostname');
    this.id = this.readString(stats, 'id');
    this.jobTimeouts = this.readNumber(stats, 'job-timeouts');
    this.maxJobSize = this.readNumber(stats, 'max-job-size');
    this.os = this.readString(stats, 'os');
    this.pid = this.readNumber(stats, 'pid');
    this.platform = this.readString(stats, 'platform');
    this.rusageStime = this.readNumber(stats, 'rusage-stime');
    this.rusageUtime = this.readNumber(stats, 'rusage-utime');
    this.totalConnections = this.readNumber(stats, 'total-connections');
    this.totalJobs = this.readNumber(stats, 'total-jobs');
    this.uptime = this.readNumber(stats, 'uptime');
    this.version = this.readString(stats, 'version');
  }

  private readNumber(stats: Record<string, string>, key: string): number {
    if (!(key in stats)) {
      throw new BeanstalkdInvalidResponseError(
        `Stats response does not include ${key}`,
      );
    }

    const val = Number(stats[key]);

    if (Number.isNaN(val))
      throw new BeanstalkdInvalidResponseError(
        `stats response contains invalid value for key "${key}". expected a number, got: "${stats[key]}"`,
      );

    return val;
  }

  private readString(stats: Record<string, string>, key: string): string {
    if (!(key in stats)) {
      throw new BeanstalkdInvalidResponseError(
        `Stats response does not include ${key}`,
      );
    }

    return stats[key];
  }
}

export class StatsCommand extends BeanstalkdCommand<StatsResult, void> {
  override compose(): Buffer {
    return cmd;
  }

  override handle(response: BeanstalkdResponse) {
    if (!(response instanceof BeanstalkdResponseOk))
      throw new BeanstalkdInvalidResponseError();

    return new StatsResult(response.data.toString());
  }
}
