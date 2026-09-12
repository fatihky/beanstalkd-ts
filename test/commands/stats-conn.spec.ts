import { describe, expect, it } from 'vitest';
import { listConnections, statsConn } from '../../src/commands';
import { ConnectionStats, OkResponse } from '../../src/responses';

const singlePayload = [
  '---',
  'id: 7',
  'addr: 127.0.0.1:54321',
  'tube: default',
  'watching: [default, foo]',
  'reserved-jobs: [101, 102]',
  'producer: true',
  'worker: false',
  'waiting: false',
  '',
].join('\n');

const sequencePayload = [
  '---',
  '- id: 1',
  '  addr: 127.0.0.1:1',
  '  tube: default',
  '  watching: [default]',
  '  reserved-jobs: []',
  '  producer: true',
  '  worker: false',
  '  waiting: false',
  '- id: 2',
  '  addr: 127.0.0.1:2',
  '  tube: foo',
  '  watching: [foo]',
  '  reserved-jobs: [55]',
  '  producer: false',
  '  worker: true',
  '  waiting: true',
  '',
].join('\n');

describe('stats-conn command', () => {
  it('composes "stats-conn\\r\\n" without an id', () => {
    expect(statsConn.compose().toString()).toBe('stats-conn\r\n');
  });

  it('composes "stats-conn <id>\\r\\n" with an id', () => {
    expect(statsConn.compose(7).toString()).toBe('stats-conn 7\r\n');
  });

  it('parses a connection stats payload, including "host:port" addr and lists', () => {
    const response = statsConn.handle(
      new OkResponse(Buffer.from(singlePayload)),
    );

    expect(response).toBeInstanceOf(ConnectionStats);
    expect(response.id).toBe(7);
    expect(response.addr).toBe('127.0.0.1:54321');
    expect(response.tube).toBe('default');
    expect(response.watching).toStrictEqual(['default', 'foo']);
    expect(response.reservedJobs).toStrictEqual([101, 102]);
    expect(response.producer).toBe(true);
    expect(response.worker).toBe(false);
    expect(response.waiting).toBe(false);
  });
});

describe('list-connections command', () => {
  it('composes "list-connections\\r\\n"', () => {
    expect(listConnections.compose().toString()).toBe('list-connections\r\n');
  });

  it('parses a sequence of connection stats', () => {
    const response = listConnections.handle(
      new OkResponse(Buffer.from(sequencePayload)),
    );

    expect(response).toHaveLength(2);
    expect(response[0]).toBeInstanceOf(ConnectionStats);
    expect(response[0].id).toBe(1);
    expect(response[0].reservedJobs).toStrictEqual([]);
    expect(response[1].id).toBe(2);
    expect(response[1].addr).toBe('127.0.0.1:2');
    expect(response[1].worker).toBe(true);
    expect(response[1].waiting).toBe(true);
  });
});
