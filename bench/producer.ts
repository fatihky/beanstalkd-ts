import { BeanstalkdClient } from '../src';

let processed = 0;
let lastChecked = Date.now();

setInterval(() => {
  const throughput = (processed * 1000) / (Date.now() - lastChecked);

  console.log(`producer throughput: ${throughput.toFixed(0)} jobs/s`);

  // reset
  lastChecked = Date.now();
  processed = 0;
}, 10000);

async function producer() {
  const client = new BeanstalkdClient();

  await client.connect();

  for (; ; processed++) {
    await client.put('test payload');
  }
}

async function main() {
  await Promise.all([producer(), producer(), producer()]);
}

main().catch((err) => {
  console.error('Main error:', err);
});
