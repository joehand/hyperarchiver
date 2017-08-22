var assert = require('assert')
var path = require('path')
var util = require('util')
var events = require('events')
var hyperdrive = require('hyperdrive')
var hyperdiscovery = require('hyperdiscovery')
var hypercoreArchiver = require('hypercore-archiver')
var archiverDiscovery = require('hypercore-archiver/swarm')
var hyperdb = require('hyperdb')
var datJson = require('dat-json')
var encoding = require('dat-encoding')
var datResolve = require('dat-link-resolve')
var datStats = require('dat-node/lib/stats') // todo: move to module (hyperdrive-stats?)
var debug = require('debug')('hyperarchiver')

module.exports = Hyperarchiver

function Hyperarchiver (storage, opts) {
  if (!(this instanceof Hyperarchiver)) return new Hyperarchiver(storage, opts)
  events.EventEmitter.call(this)
  if (typeof storage !== 'string') throw new Error('TODO: use directory storage for now')

  var self = this
  self._tracked = {}
  self._archives = hypercoreArchiver(path.join(storage, 'archives'), opts)
  self._db = hyperdb(path.join(storage, 'db'), {valueEncoding: 'utf-8'})
  self._stats = hyperdb(path.join(storage, 'stats'), {valueEncoding: 'json'})

  self._swarms = {}
  self._archives.ready(function () {
    self._swarms.archives = archiverDiscovery(self._archives)
    self._trackStats()
  })
  self._db.on('ready', function () {
    console.log('hyperdb', self._db.key.toString('hex'))
    self._swarms.db = hyperdiscovery(self._db, {live: true})
  })
  self._stats.on('ready', function () {
    console.log('stats', self._stats.key.toString('hex'))
    self._swarms.stats = hyperdiscovery(self._stats, {live: true})
  })
}

util.inherits(Hyperarchiver, events.EventEmitter)

Hyperarchiver.prototype.add = function (name, key, cb) {
  assert.equal(typeof name, 'string', 'name required')
  assert.ok(key, 'key required')

  var self = this
  datResolve(key, function (err, datKey) {
    if (err) return cb(err)
    if (typeof datKey !== 'string') datKey = datKey.toString('hex')

    self._db.put(name, datKey, function (err) {
      if (err) return cb(err)
      if (self._tracked[datKey]) self._tracked[datKey].push(name)
      else self._tracked[datKey] = { keys: [name] }
      self._archives.add(datKey, cb)
    })
  })
}

Hyperarchiver.prototype.remove = function (name, cb) {
  assert.equal(typeof name, 'string', 'name required')
  var self = this

  self._db.get(name, function (err, node) {
    if (err || !node) return cb(err || `${name} not found`)
    var datKey = node[0].value
    var tracked = self._tracked[datKey]
    if (tracked && tracked.keys.length > 1) {
      tracked.keys.pop() // don't stop archiving
      return cb()
    }
    self._archives.remove(datKey, function (err) {
      if (err) return cb(err)
      self._tracked[datKey].close()
      delete self._tracked[datKey]
      cb()
    })
  })

  // TODO
  // self._db.del(name, datKey, function (err) {
  //   if (err) return cb(err)
  // })
}

Hyperarchiver.prototype.getStats = function (name, cb) {
  assert.equal(typeof name, 'string', 'hyperarchiver: name required (string)')
  var self = this
  var key = null
  debug('getStats', name)

  try {
    key = encoding.toStr(name)
    getKeyStats(key)
  } catch (e) {
    if (e.message && e.message.indexOf('Invalid key') === -1) return cb(e)
    self._db.get(name, function (err, node) {
      if (err || !node) return cb(err)
      var key = node[0].value
      getKeyStats(key)
    })
  }

  function getKeyStats (key) {
    debug('getStats, key:', key)
    self._stats.get(key, function (err, node) {
      // TODO: if not node, wait for stats
      if (err || !node) return cb(err)
      cb(null, node[0].value)
    })
  }
}

Hyperarchiver.prototype._trackStats = function () {
  var self = this

  self._archives.on('add', function (feed) {
    var key = feed.key.toString('hex')
    debug('archiver add', key.substring(0, 15) + '...')

    if (self._tracked[key] && self._tracked[key].tracking) return

    // TODO: probably a better way to do this than a boolean here
    self._tracked[key].tracking = true
    trackFeed(feed, function (err, close) {
      if (err) {
        self._tracked[key].tracking = false
        return console.error('trackFeed error', err)
      }
      self._tracked[key].close = close
    })
  })

  self._archives.on('remove', function (feed) {
    var key = feed.key.toString('hex')
    debug('archiver remove', key.substring(0, 15) + '...')
  })

  function trackFeed (feed, cb) {
    var key = feed.key.toString('hex')
    debug('track feed', key.substring(0, 15) + '...')

    self._archives.get(key, function (err, metadata, content) {
      if (err) return console.error(err)
      if (!content) {
        // hypercore feed
        // TODO: stats for this
        self._stats.put(key, {type: 'feed', byteLength: metadata.byteLength})
        return cb(null, noop)
      }

      // storage = null to use existing storage
      var archive = hyperdrive(null, {metadata: metadata, content: content})
      trackArchive(archive, cb)
    })
  }

  function trackArchive (archive, cb) {
    var key = archive.metadata.key.toString('hex') // TODO: archive.key bug
    var stats = null
    var data = {
      type: 'archive'
    }

    datJson(archive).read(function (err, _data) {
      if (err) {
         // no dat.json file
        debug('no dat.json for archive:', key)
      }

      if (_data) data = Object.assign(data, _data)
      data.byteLength = archive.content.byteLength

      stats = datStats(archive)
      stats.on('update', updateStats)
      cb(null, close)
    })

    function updateStats () {
      // TODO: wait to write until first updates are done
      data.stats = stats.get()
      self._stats.put(key, data, function (err) {
        if (err) debug(err)
      })
    }

    function close () {
      if (!stats) return
      stats.removeListener('upload', updateStats)
    }
  }
}

Hyperarchiver.prototype.close = function (cb) {
  var self = this
  Object.keys(self._swarms).map(function (key) {
    self._swarms[key].close()
  })
  // TODO: expose archive/feeds to close too
  // Object.keys(self._tracked).map(function (key) {
  //   self._tracked[key].close()
  // })
  cb()
}

function noop () { }
