#!/usr/bin/env node

var argv = require('minimist')(process.argv.slice(2), {
  alias: {
    dir: 'd',
    help: 'h'
  },
  default: {
    httpPort: process.env.PORT || 8080,
    datPort: 3282,
    dir: require('path').join(process.cwd(), 'archives'),
    swarm: true,
    archiveHttp: true,
    debug: true
  },
  boolean: ['swarm', 'archiveHttp', 'debug', 'help']
})

if (argv.h) {
  require('./usage')()
}

if (!argv.swarm) {
  console.error('Alternative Dat server not implemented yet.\nPlease use swarm or PR =).')
  process.exit(1)
}

if (argv.debug) {
  if (typeof argv.debug === 'boolean') {
    process.env.DEBUG = 'archiver-server, archiver-api, hyperarchiver'
  } else {
    process.env.DEBUG = argv.debug
  }
}
var debug = require('debug')('hyperarchiver')

var fs = require('fs')
var http = require('http')
var Archiver = require('hypercore-archiver')
var ArchiverServer = require('archiver-server')
var ArchiverApi = require('archiver-api')
var createApp = require('./app')

try {
  fs.accessSync(argv.dir, fs.F_OK)
} catch (e) { fs.mkdirSync(argv.dir) }

var archiver = Archiver(argv.dir)
var archiverApi = ArchiverApi(archiver)
var api = createApp(archiverApi)
var datServer = ArchiverServer(archiver, {
  swarm: argv.swarm,
  http: argv.archiveHttp,
  datPort: argv.datPort
})
var apiServer = http.createServer(function (req, res) {
  if (['/add', '/remove', '/status'].indexOf(req.url) > -1) {
    return api(req, res)
  } else if (argv.archiveHttp) {
    // TODO: errors for hyperdrive-http?
    return datServer.httpRequest(req, res)
  }
  console.error('No request handler found ' + req.url)
  res.writeHead(404, {'Content-Type': 'text/plain'})
  res.write('404 Not found')
  res.end()
  return
})

datServer.swarm.once('listening', function () {
  if (argv.debug) debug('Connected to the Dat Network')
  else console.log('Connected to the Dat Network')
})
apiServer.once('listening', function () {
  if (argv.debug) debug('Server started at http://127.0.0.1:' + argv.httpPort)
  else console.log('Server started at http://127.0.0.1:' + argv.httpPort)
})
apiServer.listen(argv.httpPort)
