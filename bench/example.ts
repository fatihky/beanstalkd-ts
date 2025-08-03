import { BeanstalkdClient } from '../src';

async function main() {
  const client = new BeanstalkdClient();

  await client.connect();

  await client.use('foo');
  await client.watch('foo');
  await client.ignore('default');
  await client.put('some payload');

  const tubeStats = await client.statsTube('foo');

  console.log('tube stats:', tubeStats);

  const result = await client.reserve();

  console.log('touch result:', await client.touch(result.id));

  const jobStats = await client.statsJob(result.id);

  console.log('job stats:', jobStats);

  await client.bury(result.id);

  const kicked = await client.kickJob(result.id);

  console.log('kick job response:', kicked);

  const tubes = await client.listTubes();

  console.log('tubes:', tubes);

  console.log('watched tubes:', await client.listTubesWatched());

  console.log('using tube:', await client.listTubeUsed());

  // await client.close();
  await client.quit();
}

main().catch((err) => console.error('Main error:', err));
