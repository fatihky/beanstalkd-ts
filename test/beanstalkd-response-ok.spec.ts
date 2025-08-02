import assert from 'node:assert';
import { describe, expect, it } from 'vitest';
import { BeanstalkdProtocolError } from '../src/beanstalkd-protocol-error';
import { BeanstalkdResponseParser } from '../src/beanstalkd-response-parser';
import { BeanstalkdResponseOk } from '../src/responses';

/**
 * test beanstalkd's ok response parser
 * many commands of the beanstalkd return ok response
 * ie: list-tubes, stats, stats-job...
 */
describe('ok response', () => {
  it('parse ok response', () => {
    const parser = new BeanstalkdResponseParser();
    const input = Buffer.from('OK 12\r\nbeanstalkd-ts\r\n');
    const response = parser.read(input);

    expect(response).instanceOf(BeanstalkdResponseOk);
  });

  it('parse ok response if partially received', () => {
    const parser = new BeanstalkdResponseParser();
    const input1 = Buffer.from('OK 12\r\n');
    const input2 = Buffer.from('beanstalkd-ts\r\n');

    expect(parser.read(input1)).toBeNull(); // wait for more data

    const result = parser.read(input2);

    expect(result).instanceOf(BeanstalkdResponseOk);
  });

  it('parse ok response if partially received to commands', () => {
    const parser = new BeanstalkdResponseParser();
    const input1 = Buffer.from('OK 12\r\n');
    const input2 = Buffer.from('beanstalkd-ts\r\nOK 12\r\n'); // also contains next response's header
    const input3 = Buffer.from('beanstalkd-ts\r\n');

    expect(parser.read(input1)).toBeNull(); // wait for more data

    const result1 = parser.read(input2);

    expect(result1).instanceOf(BeanstalkdResponseOk);

    const result2 = parser.read(input3);

    expect(result2).instanceOf(BeanstalkdResponseOk);
  });

  it('should return remaining bytes to be parsed', () => {
    const input = Buffer.from('OK 12\r\nbeanstalkd-ts\r\nextra');
    const response = BeanstalkdResponseOk.parse(input);

    // parser should return remaining bytes along with the OK response
    // we expect parser to return this tuple:
    // [BeanstalkdResponseOk, Buffer]
    expect(response).toBeInstanceOf(Array);
    expect(response).toHaveLength(2);

    assert(Array.isArray(response));

    expect(response[0]).toBeInstanceOf(BeanstalkdResponseOk);
    expect(response[1]).toBeInstanceOf(Buffer);
  });

  it('should throw if data was not terminated with crlf', () => {
    const parser = new BeanstalkdResponseParser();
    const input = Buffer.from('OK 12\r\nbeanstalkd-ts some extra bytes');

    expect(() => parser.read(input)).toThrowError(BeanstalkdProtocolError);
  });

  it('should throw if <bytes> is a negative integer', () => {
    const parser = new BeanstalkdResponseParser();
    const input = Buffer.from('OK -1\r\n');

    expect(() => parser.read(input)).toThrowError(BeanstalkdProtocolError);
  });

  it('should throw if <bytes> value is not an integer', () => {
    const parser = new BeanstalkdResponseParser();
    const input = Buffer.from('OK 1.2\r\n');

    expect(() => parser.read(input)).toThrowError(BeanstalkdProtocolError);
  });

  it('should throw if <bytes> value is invalid', () => {
    const parser = new BeanstalkdResponseParser();
    const input = Buffer.from('OK invalid\r\n');

    expect(() => parser.read(input)).toThrowError(BeanstalkdProtocolError);
  });
});
