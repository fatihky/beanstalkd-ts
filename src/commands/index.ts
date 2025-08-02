import { PutCommand } from './put';
import { StatsCommand } from './stats';

export * from './command';
export * from './put';
export * from './stats';

export const stats = new StatsCommand();
export const put = new PutCommand();
