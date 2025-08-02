import { createConnection, type Socket } from 'node:net';
import { BeanstalkdResponseParser } from './beanstalkd-response-parser';
import { type StatsResult, stats } from './commands';
import type { BeanstalkdResponse } from './response';

interface BeanstalkdClientParams {
  host?: string;
  port?: number;
}

type ResponseHandler = (response: BeanstalkdResponse) => void;

export class BeanstalkdClient {
  readonly host: string;
  readonly port: number;

  private connection: Socket | null = null;
  private parser = new BeanstalkdResponseParser();
  /** response handler queue */
  private queue: ResponseHandler[] = [];

  constructor(params?: BeanstalkdClientParams) {
    this.host = params?.host ?? '127.0.0.1';
    this.port = params?.port ?? 11300;
  }

  async connect() {
    if (this.connection) return;

    await new Promise<void>((resolve) => {
      this.connection = createConnection(this.port, this.host, resolve);

      this.connection.on('data', (data) => {
        const result = this.parser.read(data);

        if (result === null) return; // wait for more data

        const handler = this.queue.shift();

        if (!handler) throw new Error('Got a response but no handlers found');

        handler(result);
      });
    });
  }

  async close() {
    await new Promise<void>((resolve) => {
      if (!this.connection || this.connection.destroyed) return;

      this.connection.end(resolve);
    });
  }

  async stats(): Promise<StatsResult> {
    return new Promise((resolve, reject) => {
      if (!this.connection) return reject(new Error('not connected'));

      this.queue.push((response) => resolve(stats.handle(response)));

      this.connection.write(stats.compose());
    });
  }
}

async function main() {
  const client = new BeanstalkdClient();

  await client.connect();

  const result = await client.stats();

  console.log('stats result:', result);

  await client.close();
}

main().catch((err) => console.error('Main error:', err));
