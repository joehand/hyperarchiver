var appa = require('appa')

module.exports = function (api) {
  var app = appa({log: {level: 'silent'}})

  app.on('/add', function (req, res, ctx) {
    api.add(req, res, ctx, function (err, code, data) {
      if (err) return app.error(res, code, err.message)
      app.send(code, data).pipe(res)
    })
  })

  app.on('/remove', function (req, res, ctx) {
    api.remove(req, res, ctx, function (err, code, data) {
      if (err) return app.error(res, code, err.message)
      app.send(code, data).pipe(res)
    })
  })

  app.on('/status', function (req, res, ctx) {
    api.status(req, res, ctx, function (err, code, data) {
      if (err) return app.error(res, code, err.message)
      app.send(code, data).pipe(res)
    })
  })

  return app
}
