export const crlf = Buffer.from('\r\n');
export const emptyBuf = Buffer.alloc(0);

export function bufStartsWith(buf: Buffer, prefix: Buffer): boolean {
  return buf.subarray(0, prefix.length).compare(prefix) === 0;
}

export function bufEndsWith(buf: Buffer, suffix: Buffer): boolean {
  return (
    buf.compare(
      suffix,
      0, // target start
      suffix.length, // target end
      Math.max(0, buf.byteLength - suffix.byteLength), // source start
    ) === 0
  );
}
