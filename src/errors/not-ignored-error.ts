/**
 * From the beanstalkd manual:
 *
 * "if the client attempts to ignore the only tube in its watch list."
 *
 * Reference: https://raw.githubusercontent.com/beanstalkd/beanstalkd/master/doc/protocol.txt
 */
export class NotIgnoredError extends Error {}
