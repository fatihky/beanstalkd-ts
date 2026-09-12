import { YamlPayload } from './utils/yaml-payload';

/**
 * Statistics about a tube.
 *
 * Beanstalkd server's response format reference:
 *
 * https://github.com/beanstalkd/beanstalkd/blob/master/prot.c#L194
 */
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

  /**
   * beanstalkd-pi extension (see "set-dlq"): the number of failed deliveries
   * a job must accumulate before being dead-lettered, or 0 if dead-letter
   * routing is disabled for this tube. Always 0 against stock beanstalkd.
   */
  readonly dlqMaxAttempts: number;
  /**
   * beanstalkd-pi extension: the tube a job is dead-lettered into once it
   * crosses `dlqMaxAttempts`, or "" if disabled. Always "" against stock
   * beanstalkd.
   */
  readonly dlqTube: string;

  constructor(payload: string) {
    const yaml = new YamlPayload(payload);

    this.name = yaml.readString('name');

    this.cmdDelete = yaml.readNumber('cmd-delete');
    this.cmdPauseTube = yaml.readNumber('cmd-pause-tube');
    this.currentJobsBuried = yaml.readNumber('current-jobs-buried');
    this.currentJobsDelayed = yaml.readNumber('current-jobs-delayed');
    this.currentJobsReady = yaml.readNumber('current-jobs-ready');
    this.currentJobsReserved = yaml.readNumber('current-jobs-reserved');
    this.currentJobsUrgent = yaml.readNumber('current-jobs-urgent');
    this.currentUsing = yaml.readNumber('current-using');
    this.currentWaiting = yaml.readNumber('current-waiting');
    this.currentWatching = yaml.readNumber('current-watching');
    this.pause = yaml.readNumber('pause');
    this.pauseTimeLeft = yaml.readNumber('pause-time-left');
    this.totalJobs = yaml.readNumber('total-jobs');

    this.dlqMaxAttempts = yaml.readOptionalNumber('dlq-max-attempts');
    this.dlqTube = yaml.readOptionalString('dlq-tube');
  }
}
