import { BeanstalkdClient } from './client';

async function main() {
  const client = new BeanstalkdClient();

  await client.connect();

  const result = await client.stats();

  console.log('stats result:', result);

  const useResult = await client.use('deneme');

  console.log('use result:', useResult);

  const putResult = await client.put('deneme');

  console.log('put result:', putResult);

  const watchResult = await client.watch('deneme');

  console.log('watch result:', watchResult);

  const ignoreResult = await client.ignore('default');

  console.log('ignore result:', ignoreResult);

  const reserveResult = await client.reserve();

  console.log('reserve result:', reserveResult);

  await client.put('deneme');
  await client.put('deneme');
  await client.put('deneme');

  const reserveWithTimeoutResult = await client.reserveWithTimeout(10);

  console.log('reserve with timeout result:', reserveWithTimeoutResult);

  const delResult = await client.deleteJob((await client.reserve()).jobId);

  console.log('delete result:', delResult);

  const releaseResult = await client.release((await client.reserve()).jobId);

  console.log('release result:', releaseResult);

  const buryResult = await client.bury((await client.reserve()).jobId);

  console.log('bury result:', buryResult);

  const pauseTubeResult = await client.pauseTube('deneme', 10);

  console.log('pause tube result:', pauseTubeResult);

  await client.close();
}

main().catch((err) => console.log('Main error:', err));
