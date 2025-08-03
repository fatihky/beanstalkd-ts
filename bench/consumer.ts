import { BeanstalkdClient } from '../src';

let processed = 0;
let lastChecked = Date.now();

setInterval(() => {
  const throughput = (processed * 1000) / (Date.now() - lastChecked);

  console.log(`consumer throughput: ${throughput.toFixed(0)} jobs/s`);

  // reset
  lastChecked = Date.now();
  processed = 0;
}, 10000);

async function consumer() {
  const client = new BeanstalkdClient();

  await client.connect();

  for (; ; processed++) {
    const job = await client.reserve();

    await client.deleteJob(job.id);
  }
}

async function main() {
  await Promise.all([
    consumer(),
    consumer(),
    consumer(),
    consumer(),
    consumer(),
    consumer(),
    consumer(),
    consumer(),
    consumer(),
    consumer(),
    consumer(),
  ]);
}

main().catch((err) => {
  console.error('Main error:', err);
});
