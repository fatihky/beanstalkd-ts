/**
 * Buried Response is treated as an error in these commands:
 * - release
 *
 * Reference: https://raw.githubusercontent.com/beanstalkd/beanstalkd/master/doc/protocol.txt
 */
export class BuriedError extends Error {}
