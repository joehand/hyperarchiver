# hyperarchiver

[![npm][npm-image]][npm-url]
[![travis][travis-image]][travis-url]
[![standard][standard-image]][standard-url]

hyperdb + hypercore-archiver. 

* Adds dats via a key/value store
* Host all dats added
* Automatically track stats over time

## Example

```js
var hyperarchiver = require('hyperarchiver')

var archiver = ('./data', {sparse: true})

archiver.add('jhand/cli-demo', 'dat://key', function (err) {
  if (err) throw err
  archiver.getStats('jhand/cli-demo', function (err, stats) {
    if (err) throw err
    console.log(stats)
  })
})
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
