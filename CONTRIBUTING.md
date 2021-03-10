# Contributing to HeartSMS

- [Contributing to HeartSMS](#contributing-to-heartsms)
  - [Building the development environment](#building-the-development-environment)
    - [Prerequisites](#prerequisites)
    - [Build the docker containers](#build-the-docker-containers)
  - [Running the development environment](#running-the-development-environment)
  - [Using the development environment](#using-the-development-environment)
  - [Test suite](#test-suite)
  - [TypeScript linting](#typescript-linting)


Contributions and pull requests are welcome! Read [Getting Started](docs/getting-started.md) to get an idea of how Heart is set up.


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

Start the containers configured in `docker-compose.dev.yml` by running:
```
npm run docker:start-dev
```

Finally, start caddy with the default Caddyfile provided in this repo. This will generate internal certificates for `api.heart.lan` and `web.heart.lan`:
```
caddy run
```


## Using the development environment

The `.api.env.example` and `.db.env.example` files are used for configuring the dev environment. Check there for passwords, ports, etc.

In dev, you may only sign up with the `test@email.com` and `test2@email.com` usernames (so we can run tests for our user whitelist). You can change this in `.api.env.example`, but know that the tests will fail until you change it back :)

The login information to test the MQTT broker is shown below. Use an application such as [MQTT Explorer](https://mqtt-explorer.com/) to inspect incoming/outgoing messages. Subscribe to the root topic (`#`), which shows messages from all topics (i.e. messages from all users). Only the `heart-sms-backend` user can subscribe to the root topic.

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

Please ensure your PR passes the tests before submitting.

First, make sure you have the dev environment running by following the steps above.

Then, you might want to open MQTT explorer and log into the `heart-sms-backend` account (see above).

Then run the tests!
```
npm run test
```


## TypeScript linting

Please lint your project before submitting a PR:

```
npm run lint
```

