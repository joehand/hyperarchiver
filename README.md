# hyperarchiver

* `create <archiver-name> <existing-changes-feed>` - create a new hypercore-archiver
* `add <archiver-name> <key>` - add key to hypercore-archiver (if writable)
* `list` - list archivers
* `info <archiver-name>` - get info for a specific archiver

Questions:

* How to dedupe keys across archivers?

[![npm][npm-image]][npm-url]
[![travis][travis-image]][travis-url]
[![standard][standard-image]][standard-url]

* Collect dats via hypercore-archiver(s)
* Track stats for each dat
* Provides db interface to stats for each collection/archive
* Shares stats information over dat

## Example

```js
var archiveCollector = require('hyperarchiver')

archiveCollector({
  storage: {
    db: './data/db',
    archives: './data/archives'
  },
  collections: {
    'city-of-portland': {
      key: '<hypercore-archiver-changes-feed>',
      sparse: true,
      dir: 'portland' // ./data/archives/portland
    }
  }
}, function (err, dbs) {
  if (err) throw err

  // get all the archives in 'dat-featured' collection
  dbs['dat-featured'].read(function (err, data) {
    console.log(data['<archive-key']) // prints dat.json and file stats
  })
})
```

The stats db will look like this:

```
/archive
  /dat.json
  /collections.json
  /dat-featured.json
```

## Install

```
npm install hyperarchiver
```

## Usage

```js
var archiver = require('hyperarchiver')
```

## License

[MIT](LICENSE.md)

[npm-image]: https://img.shields.io/npm/v/hyperarchiver.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/hyperarchiver
[travis-image]: https://img.shields.io/travis/joehand/hyperarchiver.svg?style=flat-square
[travis-url]: https://travis-ci.org/joehand/hyperarchiver
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[standard-url]: http://npm.im/standard
