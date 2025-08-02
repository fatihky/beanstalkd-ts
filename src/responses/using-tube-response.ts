import { crlf } from '../utils';
import { BeanstalkdResponse } from './beanstalkd-response';

const prefix = Buffer.from('USING ');

export class UsingTubeResponse extends BeanstalkdResponse {
  static prefix = prefix;

  constructor(readonly tube: string) {
    super();
  }

  static parse(
    buf: Buffer,
  ): UsingTubeResponse | [UsingTubeResponse, Buffer] | null {
    const expectedMinByteLength = prefix.length + crlf.byteLength + 1; // 1 byte tube name

    if (buf.byteLength < expectedMinByteLength) return null; // wait for more data

    // we won't check if buf starts with prefix. we expect that check to be done at ResponseParser

    const crlfIndex = buf.indexOf(crlf);

    if (crlfIndex < 0) return null; // wait for line ending

    const tubeName = buf.subarray(prefix.length, crlfIndex).toString('ascii');

    if (buf.length === crlfIndex + 2) {
      // no more bytes left
      return new UsingTubeResponse(tubeName);
    }

    const remaining = buf.subarray(crlfIndex + 2);

    return [new UsingTubeResponse(tubeName), remaining];
  }
}
