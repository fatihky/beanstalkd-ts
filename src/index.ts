import { BeanstalkdClient } from './client';

async function main() {
  const client = new BeanstalkdClient();

  await client.connect();

  const result = await client.stats();

  console.log('stats result:', result);

  const putResult = await client.put('deneme');

  console.log('put result:', putResult);

  await client.close();
}

main().catch((err) => console.error('Main error:', err));
