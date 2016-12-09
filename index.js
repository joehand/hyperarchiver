var assert = require('assert')
var fs = require('fs')
var Archiver = require('hypercore-archiver')
var ArchiverServer = require('archiver-server')
var ArchiverApi = require('archiver-api')

module.exports = function (opts) {
  opts = opts || {}
  assert.ok(opts.dir, 'hyperarchiver requires a directory option')

  try {
    fs.accessSync(opts.dir, fs.F_OK)
  } catch (e) { fs.mkdirSync(opts.dir) }

  var archiver = Archiver(opts.dir)
  var archiverApi = ArchiverApi(archiver)
  var datServer = ArchiverServer(archiver, {
    swarm: opts.swarm,
    http: opts.archiveHttp,
    datPort: opts.datPort
  })

  return {
    archiver: archiver,
    dat: datServer,
    api: archiverApi
  }
}
