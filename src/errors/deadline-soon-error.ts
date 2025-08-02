/**
 * From the beanstalkd manual:
 *
 * During the TTR of a reserved job, the last second is kept by the server as a
 * safety margin, during which the client will not be made to wait for another
 * job. If the client issues a reserve command during the safety margin, or if
 * the safety margin arrives while the client is waiting on a reserve command,
 * the server will respond with:
 */
export class DeadlineSoonError extends Error {}
