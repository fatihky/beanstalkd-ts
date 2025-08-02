export class BuriedError extends Error {
  constructor(
    readonly jobId: number,
    message?: string,
  ) {
    super(message);
  }
}
