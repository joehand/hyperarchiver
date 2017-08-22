var hyperarchiver = require('.')

var collector = hyperarchiver('./data', {sparse: true})
collector.add('cli-demo', 'dat://778f8d955175c92e4ced5e4f5563f69bfec0c86cc6f670352c457943666fe639', function (err) {
  if (err) return console.error(err)

  collector._db.get('cli-demo', function (err, val) {
    if (err) throw err
    if (!val || !val.length) return console.log('no data in db yet')
    collector.getStats('cli-demo', function (err, stats) {
      if (err) throw err
      console.log(stats)
    })
  })
})
