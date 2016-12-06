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

```
hyperarchiver --help
```

## License

MIT
