var test = require('tape')
var tmpDir = require('temporary-directory')
var hyperarchiver = require('..')

var datTests = [
  {name: 'cli-demo', key: '778f8d955175c92e4ced5e4f5563f69bfec0c86cc6f670352c457943666fe639'}
]

test('Add and get from db + stats', function (t) {
  tmpDir(function (_, dir, cleanup) {
    var testDat = datTests[0]
    var archiver = hyperarchiver(dir, {sparse: true})
    archiver.add(testDat.name, testDat.key, function (err) {
      t.error(err, 'no error')
      archiver.archives.list(function (err, data) {
        t.error(err, 'no error')
        t.same(testDat.key, data[0].toString('hex'), 'in archives list')

        archiver.db.get('cli-demo', function (err, val) {
          t.error(err, 'no error')
          t.same(testDat.key, val[0].value, 'key added to db')
          cleanup(function () {
            t.end()
          })
        })
      })
    })
  })
})
