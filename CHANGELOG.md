### unreleased

### v0.2.0

- added support for [beanstalkd-pi](https://github.com/fatihky/beanstalkd-pi)'s nine extension
  commands: `ping`, `putAt`, `kickTube`, `deleteTube`, `peekTube`, `statsConn`,
  `listConnections`, `setDlq`, and `capabilities`.
- added `client.detectCapabilities()` to feature-detect beanstalkd-pi extensions (returns `null`
  against stock beanstalkd instead of throwing).
- `ServerStats`/`TubeStats`/`JobStats` gained the extra beanstalkd-pi stats fields (dead-letter
  routing counters, per-extension command counters); they read as `0`/`""` against stock
  beanstalkd.
- **fix**: `YamlPayload` (used to parse `stats`/`stats-tube`/`stats-job`/etc.) now splits each line
  on the first `:` only, so a value containing a colon (e.g. `stats-conn`'s `addr: 127.0.0.1:1234`)
  is no longer truncated.
- **fix**: pinned the build to emit CommonJS (`tsconfig.json`'s `module`). A newer TypeScript
  compiler had started emitting ESM `import`/`export` syntax by default (with no `"type": "module"`
  in `package.json` and no file extensions on relative imports), which made `dist/src/index.js`
  fail to load under Node's own module resolution for any ESM consumer (`import('beanstalkd-ts')`
  in a `"type": "module"` project, or plain `node` running compiled output) — this had already
  shipped in 0.1.9. `require('beanstalkd-ts')` (the common case) was unaffected.
- **fix**: `npm run build` no longer compiles `test/`/`bench/` into `dist/` (added
  `tsconfig.build.json`, scoped to `./src`) — those were never part of the published package
  (`package.json`'s `files`), but being emitted into a committed `dist/` meant `vitest` picked them
  up too and silently ran a second, stale copy of the whole test suite alongside the real one.

### v0.1.9

- added automatic retry

### v0.1.8

- dependencies upgraded

### v0.1.7

**fix**: fixed typo in `bingloRecordsMigrated`. it must be `binlogRecordsMigrated`. (reported by @osmannyildiz)

### v0.1.6

**fix**: validate incoming data with `sourceEnd` argument in `Buffer.prototype.compare` method call. This bug arises when you issue multiple commands at once.
