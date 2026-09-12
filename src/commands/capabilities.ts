import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import {
  type BeanstalkdResponse,
  Capabilities,
  OkResponse,
} from '../responses';
import { crlf } from '../utils';
import { BeanstalkdCommand } from './command';

const cmd = Buffer.concat([Buffer.from('capabilities'), crlf]);

/**
 * beanstalkd-pi extension: lets a client discover what it's talking to (the
 * server version, its configured max job size/tube name length, and which
 * extension commands it supports) instead of probing one command at a time.
 */
export class CapabilitiesCommand extends BeanstalkdCommand<Capabilities, void> {
  override compose(): Buffer {
    return cmd;
  }

  override handle(response: BeanstalkdResponse): Capabilities {
    if (!(response instanceof OkResponse))
      throw new BeanstalkdInvalidResponseError();

    return new Capabilities(response.data.toString());
  }
}
