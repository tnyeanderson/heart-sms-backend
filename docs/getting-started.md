# Getting Started

- [Getting Started](#getting-started)
  - [System description](#system-description)
  - [Services, endpoints, and ports](#services-endpoints-and-ports)
  - [URLs](#urls)
      - [api.heart.lan](#apiheartlan)
      - [web.heart.lan](#webheartlan)
      - [mqtt.heart.lan](#mqttheartlan)
  - [Prerequisites](#prerequisites)
  - [Step-by-step](#step-by-step)
    - [Configure](#configure)
    - [Certificates](#certificates)
    - [Start the containers](#start-the-containers)
    - [Create the reverse proxy and bring it online](#create-the-reverse-proxy-and-bring-it-online)


**HeartSMS is a work in progress. It hasn't even been alpha tested yet and should NOT be used in production. This guide exists for developer reference and future releases**

Read this to learn how to deploy a HeartSMS backend to production on your server. For hacking around on a development server, see [Contributing to HeartSMS](../CONTRIBUTING.md)

In this guide, you should be replacing the example URLs, `api.heart.lan` and `web.heart.lan`, with your own api and web URLs.


## System description

The system is made up of four docker containers, configured using docker-compose. The "backend" consists of the API (`heart-sms-backend`), the database (`heart-sms-db`), and the Mosquitto MQTT broker (`heart-sms-mqtt`). The frontend is `heart-sms-web`.

In general, all four containers will run on the same server.

The API container (`heart-sms-backend`) is used by clients (phones, web clients, etc) to query the database. Each time certain database operations are made, the API also publishes a relevant message to the MQTT server, which delivers the message to all subscribed clients (phones, web clients, etc). For more information on the structure and content of MQTT messages in Heart, see `docs/mqtt.md`.

The web client also makes calls to the API, but since browsers can't use MQTT directly, a websocket endpoint is included in `heart-sms-mqtt` for web clients to connect to.

Finally, there is an `/article` endpoint which uses `@postlight/mercury-parser`. This is called from the android app in lieu of Klinker's article api, and aims to make articles more readable when viewed in the app. 

## Services, endpoints, and ports

| Description | External Port | Internal port | Reverse Proxy Endpoints           | Container         |
|-------------|---------------|---------------|-----------------------------------|-------------------|
| HTTPS API   | 443           | 5000          | api.heart.lan                     | heart-sms-backend |
| Websockets  | 443           | 5050          | api.heart.lan/api/v1/stream       | heart-sms-mqtt    |
| MQTT / TLS  | 8883          | 8883          | api.heart.lan *OR* mqtt.heart.lan | heart-sms-mqtt    |
| Web client  | 443           | 8081          | web.heart.lan                     | heart-sms-web     |
| MYSQL       | INTERNAL ONLY | 3306          | INTERNAL ONLY                     | heart-sms-db      |

*Note: the reverse proxy listens on port 80 and 443, but only uses 80 to upgrade to HTTPS*

## URLs
Heart uses the following URLs in the following way (example urls are given, you will have your own, but they will probably be similar). Keep in mind that all URLs will lead to the same IP address (the containers are all running on the same server).

#### api.heart.lan

Open ports: 
  - 80 (optional, should always redirect to HTTPS API)
  - 443 (HTTPS API)
  - 8883 (Mosquitto MQTT/TLS)

*NOTE: For more flexibility or clarity, you can also use mqtt.heart.lan:8883 assuming you direct all subdomains to the same server or have explicitly set the mqtt.heart.lan DNS record*


#### web.heart.lan

Open ports:
  - 80 (optional, should always redirect to HTTPS)
  - 443 (HTTPS)


#### mqtt.heart.lan

*Optional, but for more flexibility or clarity, you can use mqtt.heart.lan:8883 assuming you direct all subdomains (wildcard) to the same server or have explicitly set the mqtt.heart.lan DNS record. You can technically get to MQTT from any subdomain if you have a wildcard DNS record*

Open ports: 
  - 8883 (Mosquitto MQTT/TLS)


## Prerequisites

1. Please make sure you have git, caddy, docker, and docker-compose installed.
2. You must have a domain name.
3. You must generate a wildcard certificate signed by a CA for your domain (so it works for the web.* , api.* , and (optional) mqtt.* subdomains). You can use certbot for this.


Example certbot command for production certs (follow the certbot documentation for automatic renewal, etc):
```
certbot certonly --manual \
  --preferred-challenges=dns \
  --email test@email.com \
  --server https://acme-v02.api.letsencrypt.org/directory \
  --agree-tos \
  -d "*.heart.lan"
```


---

## Step-by-step

Get up and running in no time!

Clone this git repo
```
git clone git@github.com:tnyeanderson/heart-sms-backend.git

cd heart-sms-backend
```

### Configure

Copy the example config files
```
cp .db.env.example .db.env
cp .api.env.example .api.env
```

**IMPORTANT: Edit .db.env and .api.env in your favorite text editor and change the values as needed**

For instance, in `.db.env` you probably only need to change `POSTGRES_PASSWORD`:
```
DB_HOST=heart-sms-db
POSTGRES_DB=heartsms
POSTGRES_USER=heart
POSTGRES_PASSWORD=MyNewSuperSecurePassword
```

In `.api.env`, you will need to set all of the URLs to be the same (your API url), and set `HEART_USE_SSL` to `true`:
```
HEART_API_URL=api.heart.lan
HEART_WEBSOCKETS_URL=api.heart.lan
HEART_MQTT_URL=api.heart.lan   # OR mqtt.heart.lan
HEART_USE_SSL=true

# Limit user signups
# Wildcard (allow all users): *
# Or specify each user separated commas (no spaces)
HEART_ALLOWED_USERS=*
```

You can limit which usernames can be used to sign up to HeartSMS. For instance:
```
HEART_ALLOWED_USERS=test@email.com,user2,alphatester@email.com
```

**Make sure the permissions for your .env and certificate files are appropriate on the host!**

### Certificates

**Caddy**

Update the `Caddyfile` with your own URLs (no need to add a block for `mqtt.heart.lan`). Then, change the `tls internal` line to read:
```
tls /path/to/cert.crt /path/to/key.key
```

**Mosquitto**

Finally, mosquitto requires the certificates (including CA public key) to be mounted to the container. Edit the volume mounts in `docker-compose.yml` to reflect the location of the certificates on your host (see [MQTTS - SSL/TLS Setup](mqtt.md)):
```
heart-sms-mqtt:
    container_name: heart-sms-mqtt
    image: heartsms/heart-sms-mqtt
    ...
    env_file: 
      # /etc/mosquitto/conf.d/go-auth.conf is derived from .api.env
      # Comment this out during development to allow unencrypted connection between containers on :5000
      - .api.env
    volumes:
      - /path/to/cert.crt:/etc/certs/cert.pem
      - /path/to/key.key:/etc/certs/key.pem
      - /path/to/ca/publickey.pem:/etc/certs/ca.pem
```

**Make sure the permissions for your .env and certificate files are appropriate on the host!**


### Start the containers

You're ready!

```
docker-compose up -d
```

This will create the entire stack with all the containers for you, ready to go.


### Create the reverse proxy and bring it online

The last step is setting up HTTPS and routing with caddy as a reverse proxy. Once you're sure you've set your urls and cert paths in the Caddyfile, run:

```
caddy start
```

The encrypted API, MQTT, web client, and websocket endpoints are now available on the internet. You may want to [run caddy as a service](https://caddyserver.com/docs/install#linux-service) to survive restarts :)


Unfortunately, that is it for now; the Android app is not yet fully functional. See the `heart-sms-android` repo for build instructions.
