# Contributing to HeartSMS

Contributions and pull requests are welcome! Read [Getting Started](getting-started.md) to get an idea of how Heart is set up.


## Building the development environment

This environment should NOT be used for production. It also does not include the web interface as that should be tested separately, locally with npm.

This repo makes liberal use of `npm run $SCRIPT` commands for flexibility. These are derived from `package.json`, if you are curious.


### Prerequisites

1. Please make sure you have git, caddy, docker, and docker-compose installed.
2. Add the internal `heart.lan` domain and its subdomains to your `/etc/hosts` file (see below), or add to dnsmasq.
3. Clone or download this repo and `cd` into its root folder

**Add the internal domains to your localhost line in `/etc/hosts`:**
```
127.0.0.1 localhost api.heart.lan web.heart.lan mqtt.heart.lan
```


### Build the docker containers

Run the following command to build all the containers with the `dev` tag: `heart-sms-db`, `heart-sms-backend`, and `heart-sms-mqtt`:
```
npm run build-dev
```


## Running the development environment

The first time you run the containers, please start the `db` container first using the following command, and wait a minute or so to initialize the database:
```
npm run db:init-dev
```

After you initialize the db container, follow the logs and **be sure to save the generated MySQL root user password. It won't ever be shown again!!**

Once you see the following log message (the logs should stop coming after this), you can `CTRL+C` to stop the container:
```
/usr/sbin/mysqld: ready for connections.
```

Once the db has been initialized, start the containers configured in `docker-compose.dev.yml` by running:
```
npm run docker:start-dev
```

*On subsequent runs, you don't have to re-initialize the DB as it is stored in a volume. All API calls will make changes to the `heartsms-dev` database ONLY.*

Finally, start caddy with the default Caddyfile provided in this repo.This will also generate internal certificates for `api.heart.lan` and `web.heart.lan`:
```
caddy run
```


## Using the development environment

The `.api.env.example` and `.db.env.example` files are used for configuring the dev environment. Check there for passwords, ports, etc.

The login information to test the MQTT broker is shown below. Use an application such as [MQTT Explorer](https://mqtt-explorer.com/) to inspect incoming/outgoing messages. Subscribe to the root topic (`#`), which shows messages from all topics. Only the `heart-sms-backend` user can subscribe to the root topic.

```
Protocol:   mqtt://
Host:       localhost
Port:       1883
Username:   heart-sms-backend
Password:   testpassword
TLS/SSL:    off
```

You can make requests to the API at either `localhost:5000` or `https://api.heart.lan`.

You can connect to the database at `localhost:3306` with the username and password found in `.db.env.example`.


## Test suite

Right now the testing is pretty dirty with a *lot* of blind spots, but it seems to work alright enough for now.

First, make sure you have the dev environment running by following the steps above.

Then, you might want to open MQTT explorer and log into the `heart-sms-backend` account (see above).

Then run the tests!
```
npm run test
```

You can look over the stream manually in MQTT Explorer and check against [our MQTT documentation](mqtt.md). Tests need to be written for receiving the websocket and mqtt messages. (The responses look good as of this commit by my error-prone eyes)



