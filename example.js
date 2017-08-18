var hyperarchiver = require('.')

var collector = hyperarchiver('./data', {sparse: true})
collector.add('cli-demo', 'dat://778f8d955175c92e4ced5e4f5563f69bfec0c86cc6f670352c457943666fe639', function (err) {
  if (err) return console.error(err)

  collector.db.get('cli-demo', function (err, val) {
    if (err) throw err
    collector.statsDb.get(val[0].value, function (err, val) {
      if (err) throw err
      console.log('val', val[0].value)
    })
  })
})
