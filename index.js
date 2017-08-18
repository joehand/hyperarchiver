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
var datResolve = require('dat-link-resolve')
var datStats = require('dat-node/lib/stats') // todo: move to module (hyperdrive-stats?)
var debug = require('debug')('hyperarchiver')

module.exports = Hyperarchiver

function Hyperarchiver (storage, opts) {
  if (!(this instanceof Hyperarchiver)) return new Hyperarchiver(storage, opts)
  events.EventEmitter.call(this)
  if (typeof storage !== 'string') throw new Error('TODO: use directory storage for now')

  var self = this
  self._trackedFeeds = {}
  self.archives = hypercoreArchiver(path.join(storage, 'archives'), opts)
  self.db = hyperdb(path.join(storage, 'db'), {valueEncoding: 'utf-8'})
  self.statsDb = hyperdb(path.join(storage, 'stats'), {valueEncoding: 'json'})

  archiverDiscovery(self.archives)
  self.db.on('ready', function () {
    console.log('hyperdb', self.db.key.toString('hex'))
    hyperdiscovery(self.db, {live: true})
  })
  self.statsDb.on('ready', function () {
    console.log('statsDb', self.statsDb.key.toString('hex'))
    hyperdiscovery(self.statsDb, {live: true})
  })
  self._trackStats()
}

util.inherits(Hyperarchiver, events.EventEmitter)

Hyperarchiver.prototype.add = function (name, key, cb) {
  assert.equal(typeof name, 'string', 'name required')
  assert.ok(key, 'key required')

  var self = this
  datResolve(key, function (err, datKey) {
    if (err) return cb(err)
    if (typeof datKey !== 'string') datKey = datKey.toString('hex')

    self.db.put(name, datKey, function (err) {
      if (err) return cb(err)
      if (self._trackedFeeds[datKey]) self._trackedFeeds[datKey].push(name)
      else self._trackedFeeds[datKey] = { keys: [name] }
      self.archives.add(datKey, cb)
    })
  })
}

Hyperarchiver.prototype.remove = function (name, cb) {
  assert.equal(typeof name, 'string', 'name required')
  var self = this

  self.db.get(name, function (err, node) {
    if (err || !node) return cb(err || `${name} not found`)
    self.archives.remove(node[0].value, cb)
  })

  // TODO
  // self.db.del(name, datKey, function (err) {
  //   if (err) return cb(err)
  // })
}

Hyperarchiver.prototype._trackStats = function () {
  var self = this

  self.archives.on('add', function (feed) {
    var key = feed.key.toString('hex')
    debug('added', key.substring(0, 15) + '...', self._trackedFeeds[key])

    if (self._trackedFeeds[key] && self._trackedFeeds[key].tracking) return

    trackFeed(feed) // TODO: add to object so we can del + stop tracking
    self._trackedFeeds[key].tracking = true
  })

  function trackFeed (feed) {
    var key = feed.key.toString('hex')
    debug('track feed', key.substring(0, 15) + '...')

    self.archives.get(key, function (err, metadata, content) {
      if (err) return console.error(err)
      if (!content) {
        // hypercore feed
        return self.statsDb.put(key, {type: 'feed', byteLength: metadata.byteLength})
      }

      var archive = hyperdrive(null, {metadata: metadata, content: content})
      datJson(archive).read(function (err, data) {
        if (err) {
           // no dat.json file
          debug('no dat.json for archive:', key)
        }

        var stats = datStats(archive)
        if (!data) data = {}

        data.byteLength = content.byteLength
        data.type = 'archive'

        stats.on('update', function () {
          // TODO: wait to write until first updates are done
          data.stats = stats.get()
          self.statsDb.put(key, data, function (err) {
            if (err) debug(err)
          })
        })
      })
    })
  }
}
