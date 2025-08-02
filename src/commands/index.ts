import { PutCommand } from './put';
import { StatsCommand } from './stats';
import { UseCommand } from './use';

export * from './command';
export * from './put';
export * from './stats';
export * from './use';

export const stats = new StatsCommand();
export const put = new PutCommand();
export const use = new UseCommand();
