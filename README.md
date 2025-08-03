# Beanstalkd Client with full TypeScript support

Installation:

```sh
npm install beanstalkd-ts
```

Usage:

```ts
import { BeanstalkdClient } from 'beanstalkd-ts'

const client = new BeanstalkdClient()

await client.connect()

await client.put("some payload")

const result = await client.reserveWithTimeout(10);

await client.deleteJob(result.jobId)
```

For the list of available commands, refer to the official beanstalkd manual: https://raw.githubusercontent.com/beanstalkd/beanstalkd/master/doc/protocol.txt

### Features

* **All commands** and their success results are typed. (OkResponse, InsertedResponse etc..)
* **All beanstalkd errors are typed** through specific classes each (NotFoundError, ExpectedCrlfError, etc..)
* Fully unit tested.
* Throws errors with extra call stack (preserves original call stack)

### Non-features
* DOES NOT handle auto-reconnect. Thus you need to handle the "close" event. And issue your `.use`/`.watch`/`.ignore` calls right after the `.connect` call.
  You might want to stop the worker process and let process manager to wait for beanstalkd to become available.
