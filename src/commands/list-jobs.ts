import { BeanstalkdInvalidResponseError } from '../beanstalkd-invalid-response-error';
import {
  type BeanstalkdResponse,
  JobListEntry,
  OkResponse,
} from '../responses';
import { YamlPayload } from '../responses/utils/yaml-payload';
import { BeanstalkdCommand } from './command';
import type { PeekTubeState } from './peek-tube';

export interface ListJobsParams {
  tube: string;
  state: PeekTubeState;
  /** max jobs to return (server default: 100, silently capped at 10000) */
  limit?: number;
}

/**
 * beanstalkd-pi extension: a bounded, non-destructive listing of a tube's
 * ready, delayed, or buried jobs (job bodies are not included; follow up
 * with `peek(id)` for a specific job's body).
 *
 * @throws {NotFoundError} if the named tube does not exist.
 */
export class ListJobsCommand extends BeanstalkdCommand<
  JobListEntry[],
  ListJobsParams
> {
  override compose({ tube, state, limit }: ListJobsParams): Buffer {
    return Buffer.from(
      `list-jobs ${tube} ${state}${limit === undefined ? '' : ` ${limit}`}\r\n`,
    );
  }

  override handle(response: BeanstalkdResponse): JobListEntry[] {
    if (!(response instanceof OkResponse))
      throw new BeanstalkdInvalidResponseError(
        'list-jobs command expects an "ok" response',
      );

    return YamlPayload.splitSequenceEntries(response.data.toString()).map(
      (entry) => new JobListEntry(entry),
    );
  }
}
