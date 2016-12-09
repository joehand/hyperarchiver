# Hyperarchiver [![Travis](https://travis-ci.org/joehand/hyperarchiver.svg)](https://travis-ci.org/joehand/hyperarchiver) [![npm](https://img.shields.io/npm/v/hyperarchiver.svg)](https://npmjs.org/package/hyperarchiver)

Zero config server and API for hypercore-archiver.

### Features

* **Rest API**: Add & remove archives to host & backup
* **Dat Network**: Connect automatically to archives over the Dat network. Acts as a public peer for all archives added.
* **Access Archives via HTTP**: View metadata and archive files over HTTP.

Built with:

* [hypercore-archiver](https://github.com/mafintosh/hypercore-archiver): Storage, archive management and replication
* [archiver-server](https://github.com/joehand/archiver-server): Serve archives via [discovery-swarm](https://github.com/mafintosh/discovery-swarm) and [hyperdrive-http](https://github.com/joehand/hyperdrive-http)
* [archiver-api](https://github.com/joehand/archiver-api): Rest API for hypercore-archiver

## Usage

### Install from NPM:

```
npm install -g hyperarchiver
```

### Run the servers!

```
hyperarchiver --dir archives
```

This starts two servers, one for HTTP access and one for Dat Network access.

* Archives will be stored in directory specified by `--dir`.
* Add new archives by sending a POST request to `/add`.
* Added archives will be available over the Dat network
* Access archives over http via `/<archive-key>`

### Add Archives

Once the server is running, you can add archives (make sure you are hosting them over Dat). Send a POST request with `YOUR_DAT_KEY`:

```
curl -X POST -H "Content-Type: application/json" -d '{"key":"YOUR_DAT_KEY"}' http://127.0.0.1:8080/add
```

### Usage Details

See all the options by running with the `--help` option:

```
hyperarchiver --help
```

### Http Routes

#### `/add`: add a new archive

Send a POST request to `/add` with a JSON object, `{"key": "YOUR_DAT_KEY"}`, to add a new archive.

hyperarchiver will connect to the archive over Dat, copy it, and serve it over Dat and HTTP.

#### `/remove`: remove an archive

Send a POST request to `/remove` with a JSON object, `{"key": "YOUR_DAT_KEY"}`, to remove a new archive.

hyperarchiver stop serving the archive and remove it from the database.

#### `/status`: hyperarchiver status

Send a GET request to `/status` to view the hyperarchiver status.

#### `/<archive-key>`

View metadata for an archive that has been added.

#### `/<archive-key>/<file>`

View a file in an archive.

## API

### `var hyperarchiver = Hyperarchiver(opts)`

Create a `hypercore-archiver` and attach the `archiver-server` and `archiver-api`. Hyperarchiver doesn't do much besides glue those three modules together.

```js
opts = {
  dir: 'archives', // required
  swarm: true, // join dat swarm.
  archiveHttp: true, // serve archives over http
  datPort: 3282, // port for dat swarm
}
```

* `hyperarchiver.api` is `archiver-api`
* `hyperarchiver.dat` is `archiver-server`
* `hyperarchiver.archiver` is `hypercore-archiver`

See `cli.js` for example usage.

## License

MIT
