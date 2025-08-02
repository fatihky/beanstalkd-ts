export class JobBuriedError extends Error {
  constructor(
    readonly jobId: number,
    message?: string,
  ) {
    super(message);
  }
}
