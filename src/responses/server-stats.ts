import { YamlPayload } from './utils/yaml-payload';

export class ServerStats {
  readonly binlogCurrentIndex: number;
  readonly binlogMaxSize: number;
  readonly binlogOldestIndex: number;
  readonly binlogRecordsMigrated: number;
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

  /**
   * beanstalkd-pi extensions: stats counters for the thirteen extension
   * commands plus dead-letter routing, alongside the stock ones above. All
   * 0 against stock beanstalkd.
   */
  readonly cmdPutAt: number;
  readonly cmdKickTube: number;
  readonly cmdDeleteTube: number;
  readonly cmdPeekTube: number;
  readonly cmdListJobs: number;
  readonly cmdStatsConn: number;
  readonly cmdListConnections: number;
  readonly cmdListTubesPaused: number;
  readonly cmdStatsTubeAll: number;
  readonly cmdPing: number;
  readonly cmdSetDlq: number;
  readonly cmdCapabilities: number;
  readonly cmdDrain: number;
  /** total number of jobs automatically routed to a dead-letter tube by "set-dlq". */
  readonly jobDeadLettered: number;

  constructor(payload: string) {
    const yaml = new YamlPayload(payload);

    this.binlogCurrentIndex = yaml.readNumber('binlog-current-index');
    this.binlogMaxSize = yaml.readNumber('binlog-max-size');
    this.binlogOldestIndex = yaml.readNumber('binlog-oldest-index');
    this.binlogRecordsMigrated = yaml.readNumber('binlog-records-migrated');
    this.binlogRecordsWritten = yaml.readNumber('binlog-records-written');
    this.cmdBury = yaml.readNumber('cmd-bury');
    this.cmdDelete = yaml.readNumber('cmd-delete');
    this.cmdIgnore = yaml.readNumber('cmd-ignore');
    this.cmdKick = yaml.readNumber('cmd-kick');
    this.cmdListTubeUsed = yaml.readNumber('cmd-list-tube-used');
    this.cmdListTubesWatched = yaml.readNumber('cmd-list-tubes-watched');
    this.cmdListTubes = yaml.readNumber('cmd-list-tubes');
    this.cmdPauseTube = yaml.readNumber('cmd-pause-tube');
    this.cmdPeekBuried = yaml.readNumber('cmd-peek-buried');
    this.cmdPeekDelayed = yaml.readNumber('cmd-peek-delayed');
    this.cmdPeekReady = yaml.readNumber('cmd-peek-ready');
    this.cmdPeek = yaml.readNumber('cmd-peek');
    this.cmdPut = yaml.readNumber('cmd-put');
    this.cmdRelease = yaml.readNumber('cmd-release');
    this.cmdReserveWithTimeout = yaml.readNumber('cmd-reserve-with-timeout');
    this.cmdReserve = yaml.readNumber('cmd-reserve');
    this.cmdStatsJob = yaml.readNumber('cmd-stats-job');
    this.cmdStatsTube = yaml.readNumber('cmd-stats-tube');
    this.cmdStats = yaml.readNumber('cmd-stats');
    this.cmdTouch = yaml.readNumber('cmd-touch');
    this.cmdUse = yaml.readNumber('cmd-use');
    this.cmdWatch = yaml.readNumber('cmd-watch');
    this.currentConnections = yaml.readNumber('current-connections');
    this.currentJobsBuried = yaml.readNumber('current-jobs-buried');
    this.currentJobsDelayed = yaml.readNumber('current-jobs-delayed');
    this.currentJobsReady = yaml.readNumber('current-jobs-ready');
    this.currentJobsReserved = yaml.readNumber('current-jobs-reserved');
    this.currentJobsUrgent = yaml.readNumber('current-jobs-urgent');
    this.currentProducers = yaml.readNumber('current-producers');
    this.currentTubes = yaml.readNumber('current-tubes');
    this.currentWaiting = yaml.readNumber('current-waiting');
    this.currentWorkers = yaml.readNumber('current-workers');
    this.draining = yaml.readString('draining');
    this.hostname = yaml.readString('hostname');
    this.id = yaml.readString('id');
    this.jobTimeouts = yaml.readNumber('job-timeouts');
    this.maxJobSize = yaml.readNumber('max-job-size');
    this.os = yaml.readString('os');
    this.pid = yaml.readNumber('pid');
    this.platform = yaml.readString('platform');
    this.rusageStime = yaml.readNumber('rusage-stime');
    this.rusageUtime = yaml.readNumber('rusage-utime');
    this.totalConnections = yaml.readNumber('total-connections');
    this.totalJobs = yaml.readNumber('total-jobs');
    this.uptime = yaml.readNumber('uptime');
    this.version = yaml.readString('version');

    this.cmdPutAt = yaml.readOptionalNumber('cmd-put-at');
    this.cmdKickTube = yaml.readOptionalNumber('cmd-kick-tube');
    this.cmdDeleteTube = yaml.readOptionalNumber('cmd-delete-tube');
    this.cmdPeekTube = yaml.readOptionalNumber('cmd-peek-tube');
    this.cmdListJobs = yaml.readOptionalNumber('cmd-list-jobs');
    this.cmdStatsConn = yaml.readOptionalNumber('cmd-stats-conn');
    this.cmdListConnections = yaml.readOptionalNumber('cmd-list-connections');
    this.cmdListTubesPaused = yaml.readOptionalNumber('cmd-list-tubes-paused');
    this.cmdStatsTubeAll = yaml.readOptionalNumber('cmd-stats-tube-all');
    this.cmdPing = yaml.readOptionalNumber('cmd-ping');
    this.cmdSetDlq = yaml.readOptionalNumber('cmd-set-dlq');
    this.cmdCapabilities = yaml.readOptionalNumber('cmd-capabilities');
    this.cmdDrain = yaml.readOptionalNumber('cmd-drain');
    this.jobDeadLettered = yaml.readOptionalNumber('job-dead-lettered');
  }
}
