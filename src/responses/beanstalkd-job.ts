export class BeanstalkdJob {
  constructor(
    readonly id: number,
    readonly payload: Buffer,
  ) {}
}
