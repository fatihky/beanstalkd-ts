import { describe, expect, it } from 'vitest';
import { BeanstalkdProtocolError } from '../../../src/beanstalkd-protocol-error';
import { parseHeaderWithValues } from '../../../src/responses/utils/parse-header';

describe('parse response header', () => {
  it('should parse headers without values', () => {
    const prefix = Buffer.from('RESULT');
    const result = parseHeaderWithValues(
      Buffer.from('RESULT\r\n'),
      prefix,
      null,
    );

    expect(result).toBe(true);
  });

  it('should parse headers with string values', () => {
    const prefix = Buffer.from('RESULT ');

    expect(
      parseHeaderWithValues(Buffer.from('RESULT foo\r\n'), prefix, {
        strCount: 1,
      }),
    ).toStrictEqual(['foo']);

    expect(
      parseHeaderWithValues(Buffer.from('RESULT foo bar baz\r\n'), prefix, {
        strCount: 3,
      }),
    ).toStrictEqual(['foo', 'bar', 'baz']);
  });

  it('should parse headers with integer values', () => {
    const prefix = Buffer.from('RESULT ');

    expect(
      parseHeaderWithValues(Buffer.from('RESULT 1\r\n'), prefix, {
        intCount: 1,
      }),
    ).toStrictEqual([1]);

    expect(
      parseHeaderWithValues(Buffer.from('RESULT 1 2 3\r\n'), prefix, {
        intCount: 3,
      }),
    ).toStrictEqual([1, 2, 3]);
  });

  it('should throw if we got an invalid prefix', () => {
    const prefix = Buffer.from('RESULT');

    expect(() =>
      parseHeaderWithValues(Buffer.from('INVALID PREFIX\r\n'), prefix, null),
    ).toThrowError(BeanstalkdProtocolError);
  });

  it('should throw if we got incorrect number of values', () => {
    const prefix = Buffer.from('RESULT ');

    // string values
    expect(() =>
      parseHeaderWithValues(Buffer.from('RESULT a b c\r\n'), prefix, {
        strCount: 1,
      }),
    ).toThrowError(BeanstalkdProtocolError);
    expect(() =>
      parseHeaderWithValues(Buffer.from('RESULT \r\n'), prefix, {
        strCount: 1,
      }),
    ).toThrowError(BeanstalkdProtocolError);

    // integer values
    expect(() =>
      parseHeaderWithValues(Buffer.from('RESULT 1 2 3\r\n'), prefix, {
        intCount: 1,
      }),
    ).toThrowError(BeanstalkdProtocolError);
    expect(() =>
      parseHeaderWithValues(Buffer.from('RESULT \r\n'), prefix, {
        intCount: 1,
      }),
    ).toThrowError(BeanstalkdProtocolError);
  });

  it('should throw an error if invalid integer values are passed', () => {
    const prefix = Buffer.from('RESULT ');

    expect(() =>
      parseHeaderWithValues(Buffer.from('RESULT a b c\r\n'), prefix, {
        intCount: 3,
      }),
    ).toThrowError(BeanstalkdProtocolError);

    expect(() =>
      parseHeaderWithValues(Buffer.from('RESULT 1 2 3.5\r\n'), prefix, {
        intCount: 3,
      }),
    ).toThrowError(BeanstalkdProtocolError);
  });
});
