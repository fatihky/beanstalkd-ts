import { PutCommand } from './put';
import { ReserveCommand } from './reserve';
import { ReserveJobCommand } from './reserve-job';
import { ReserveWithTimeoutCommand } from './reserve-with-timeout';
import { StatsCommand } from './stats';
import { UseCommand } from './use';

export * from './command';
export * from './put';
export * from './reserve';
export * from './reserve-job';
export * from './reserve-with-timeout';
export * from './stats';
export * from './use';

export const put = new PutCommand();
export const reserve = new ReserveCommand();
export const reserveJob = new ReserveJobCommand();
export const reserveWithTimeout = new ReserveWithTimeoutCommand();
export const stats = new StatsCommand();
export const use = new UseCommand();
