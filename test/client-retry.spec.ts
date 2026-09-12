import { createServer, type Socket } from 'node:net';
import getPort from 'get-port';
import { describe, expect, it } from 'vitest';
import { BeanstalkdClient } from '../src/client';
import { DeletedResponse } from '../src/responses';

describe('beanstalkd client retry/auto-reconnect', () => {
  it('connect() retries with backoff until the server becomes available', async () => {
    const port = await getPort();
    const serverResponse = Buffer.from('DELETED\r\n');
    const server = createServer((conn) => {
      conn.on('data', () => conn.write(serverResponse));
    });

    const reconnectingAttempts: number[] = [];
    const client = new BeanstalkdClient({
      port,
      retry: { initialDelayMs: 20, maxDelayMs: 50, factor: 1.5 },
      onReconnecting: (attempt) => reconnectingAttempts.push(attempt),
    });

    try {
      // start connecting before the server is listening; nobody's there yet
      const connectPromise = client.connect();

      // let a couple of failed attempts happen
      await new Promise((resolve) => setTimeout(resolve, 80));
      expect(reconnectingAttempts.length).toBeGreaterThan(0);

      await new Promise<void>((resolve) => server.listen(port, resolve));

      // connect() should now resolve once the server accepts the connection
      await connectPromise;

      await expect(client.deleteJob(1)).resolves.toBeInstanceOf(
        DeletedResponse,
      );
    } finally {
      await client.close();
      server.close();
    }
  });

  it('automatically reconnects after an unexpected disconnect', async () => {
    const port = await getPort();
    const serverResponse = Buffer.from('DELETED\r\n');
    const sockets: Socket[] = [];
    let connectionResolver: ((socket: Socket) => void) | null = null;
    const waitForConnection = () =>
      new Promise<Socket>((resolve) => {
        connectionResolver = resolve;
      });

    const server = createServer((conn) => {
      sockets.push(conn);
      conn.on('data', () => conn.write(serverResponse));
      connectionResolver?.(conn);
      connectionResolver = null;
    });

    let resolveReconnected!: () => void;
    const reconnected = new Promise<void>((resolve) => {
      resolveReconnected = resolve;
    });

    const client = new BeanstalkdClient({
      port,
      retry: { initialDelayMs: 20, maxDelayMs: 50 },
      onReconnected: () => resolveReconnected(),
    });

    try {
      await new Promise<void>((resolve) => server.listen(port, resolve));

      const firstConnection = waitForConnection();
      await client.connect();
      await firstConnection;

      expect(sockets.length).toBe(1);

      // simulate the connection dropping unexpectedly (e.g. beanstalkd restarting)
      const secondConnection = waitForConnection();
      sockets[0]?.destroy();

      await reconnected;
      await secondConnection;

      expect(sockets.length).toBe(2);

      // the client should be fully usable again, transparently
      await expect(client.deleteJob(1)).resolves.toBeInstanceOf(
        DeletedResponse,
      );
    } finally {
      await client.close();
      server.close();
    }
  });

  it('a command in flight during a disconnect is rejected, not left hanging', async () => {
    const port = await getPort();
    const sockets: Socket[] = [];
    // never respond, so the command stays in-flight until we drop the connection
    const server = createServer((conn) => {
      sockets.push(conn);
    });

    const client = new BeanstalkdClient({
      port,
      retry: { initialDelayMs: 20, maxDelayMs: 50 },
    });

    try {
      await new Promise<void>((resolve) => server.listen(port, resolve));
      await client.connect();

      const pending = client.deleteJob(1);

      await new Promise((resolve) => setTimeout(resolve, 20));
      sockets[0]?.destroy();

      await expect(pending).rejects.toThrow();
    } finally {
      await client.close();
      server.close();
    }
  });

  it('with retry disabled, connect() fails fast like before', async () => {
    const port = await getPort();
    // nothing is listening on this port

    const client = new BeanstalkdClient({ port, retry: false });

    await expect(client.connect()).rejects.toThrow();
  });
});
