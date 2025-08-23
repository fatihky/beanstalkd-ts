### v0.1.7
**fix**: fixed typo in `bingloRecordsMigrated`. it must be `binlogRecordsMigrated`. (reported by @osmannyildiz)

### v0.1.6

**fix**: validate incoming data with `sourceEnd` argument in `Buffer.prototype.compare` method call. This bug arises when you issue multiple commands at once.
