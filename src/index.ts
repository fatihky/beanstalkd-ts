import { BeanstalkdClient } from './client';

async function main() {
  const client = new BeanstalkdClient();

  await client.connect();

  const result = await client.stats();

  console.log('stats result:', result);

  const putResult = await client.put('deneme');

  console.log('put result:', putResult);

  const useResult = await client.use('deneme');

  console.log('use result:', useResult);

  const reserveResult = await client.reserve();

  console.log('reserve result:', reserveResult);

  const reserveWithTimeoutResult = await client.reserveWithTimeout(10);

  console.log('reserve with timeout result:', reserveWithTimeoutResult);

  const delResult = await client.deleteJob(reserveWithTimeoutResult.jobId);

  console.log('delete result:', delResult);

  const pauseTubeResult = await client.pauseTube('deneme', 10);

  console.log('pause tube result:', pauseTubeResult);

  await client.close();
}

main().catch((err) => console.log('Main error:', err));
