import { createConnection, type Socket } from 'node:net';

interface BeanstalkdClientParams {
  host?: string;
  port?: number;
}

export class BeanstalkdClient {
  readonly host: string;
  readonly port: number;

  private connection: Socket | null = null;

  constructor(params?: BeanstalkdClientParams) {
    this.host = params?.host ?? '127.0.0.1';
    this.port = params?.port ?? 11300;
  }

  async connect() {
    if (this.connection) return;

    await new Promise<void>((resolve) => {
      this.connection = createConnection(this.port, this.host, resolve);
    });
  }

  async close() {
    await new Promise<void>((resolve) => {
      if (!this.connection || this.connection.destroyed) return;

      this.connection.end(resolve);
    });
  }
}

async function main() {
  const client = new BeanstalkdClient();

  await client.connect();

  await client.close();
}

main().catch((err) => console.error('Main error:', err));
