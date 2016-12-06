module.exports = function () {
  console.error('Usage: hyperarchiver [options]')
  console.error('')
  console.error('   hyperarchiver                  start the api and dat servers')
  console.error('')
  console.error('     --dir=<folder>               directory to store archives')
  console.error('     --httpPort=8080              http port for API and hyperdrive-http')
  console.error('     --datPort=3282               port for Dat discovery swarm')
  console.error('     --archiveHttp                serve archives over http')
  console.error('     --debug                      show debugging output')
  console.error('     --help, -h                   show usage guide')
  console.error('')
  process.exit(1)
}
