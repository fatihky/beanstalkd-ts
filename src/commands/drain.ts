import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import {
  type BeanstalkdResponse,
  DrainingResponse,
  NotDrainingResponse,
} from '../responses';
import { BeanstalkdCommand } from './command';

export type DrainAction = 'on' | 'off' | 'status';

/**
 * beanstalkd-pi extension: turns drain mode on or off, or reports its
 * current state, as an alternative to sending SIGUSR1 to the process.
 * While draining, "put"/"put-at" are rejected with `DrainingError`, but
 * every other command keeps working normally.
 *
 * Resolves to whether the server is draining *after* the command runs, so
 * "status" and a same-state "on"/"off" resolve the same way.
 */
export class DrainCommand extends BeanstalkdCommand<boolean, DrainAction> {
  override compose(action: DrainAction): Buffer {
    return Buffer.from(`drain ${action}\r\n`);
  }

  override handle(response: BeanstalkdResponse): boolean {
    if (response instanceof DrainingResponse) return true;
    if (response instanceof NotDrainingResponse) return false;

    throw new BeanstalkdInvalidResponseError(
      'drain command expects a "draining" or "not_draining" response',
    );
  }
}
