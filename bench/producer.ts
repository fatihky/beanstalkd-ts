import { BeanstalkdClient } from '../src';

async function producer() {
  const client = new BeanstalkdClient();

  await client.connect();

  for (;;) {
    await client.put('test payload');
  }
}

async function main() {
  await Promise.all([producer(), producer(), producer()]);
}

main().catch((err) => {
  console.error('Main error:', err);
});
