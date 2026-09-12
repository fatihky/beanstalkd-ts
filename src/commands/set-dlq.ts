import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import { type BeanstalkdResponse, DlqSetResponse } from '../responses';
import { BeanstalkdCommand } from './command';

export interface SetDlqParams {
  tube: string;
  /** number of failed deliveries (releases + TTR timeouts) before dead-lettering; 0 disables it */
  maxAttempts: number;
  /** tube a job is buried into once it crosses `maxAttempts`; ignored (but still validated) when `maxAttempts` is 0 */
  deadTube: string;
}

/**
 * beanstalkd-pi extension: configures automatic dead-letter routing for a
 * tube. `tube` is created if missing, like "use"; `deadTube` is not.
 */
export class SetDlqCommand extends BeanstalkdCommand<void, SetDlqParams> {
  override compose({ tube, maxAttempts, deadTube }: SetDlqParams): Buffer {
    return Buffer.from(`set-dlq ${tube} ${maxAttempts} ${deadTube}\r\n`);
  }

  override handle(response: BeanstalkdResponse): void {
    if (response instanceof DlqSetResponse) return;

    throw new BeanstalkdInvalidResponseError(
      'set-dlq command expects a "dlq_set" response',
    );
  }
}
