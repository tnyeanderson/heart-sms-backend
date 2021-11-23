# Getting Started

- [Getting Started](#getting-started)
  - [System description](#system-description)
  - [Services, endpoints, and ports](#services-endpoints-and-ports)
  - [URLs](#urls)
      - [api.heart.lan](#apiheartlan)
      - [web.heart.lan](#webheartlan)
      - [push.heart.lan](#pushheartlan)
  - [Prerequisites](#prerequisites)
  - [Step-by-step](#step-by-step)
    - [Configure](#configure)
    - [Certificates](#certificates)
    - [Start the containers](#start-the-containers)


**HeartSMS is a work in progress. It hasn't even been alpha tested yet and should NOT be used in production. This guide exists for developer reference and future releases**

Read this to learn how to deploy a HeartSMS backend to production on your server. For hacking around on a development server, see [Contributing to HeartSMS](../CONTRIBUTING.md)

In this guide, you should be replacing the example URLs, `api.heart.lan` and `web.heart.lan`, with your own api and web URLs.


## System description

The system is made up of five docker containers, configured using docker-compose. The "backend" consists of the API (`heart-sms-backend`), the database (`heart-sms-db`), and a Gotify server (`heart-sms-push`). The frontend is `heart-sms-web`. A `caddy` container is used to reverse proxy connections to these containers and provide SSL.

In general, all five containers will run on the same server.

The API container (`heart-sms-backend`) is used by clients (phones, web clients, etc) to query the database. Each time certain database operations are made, the API also publishes a relevant message to the Gotify server, which pushes the message to all subscribed clients (phones, web clients, etc). For more information on the structure and content of push messages in Heart, see `docs/push.md`.

The web client also makes calls to the API, and connects to the websocket endpoint included in `heart-sms-push`.

Finally, there is an `/article` endpoint which uses `@postlight/mercury-parser`. This is called from the android app in lieu of Klinker's article api, and aims to make articles more readable when viewed in the app. 

## Services, endpoints, and ports

| Description | External Port | Internal port | Reverse Proxy Endpoints | Container         |
|-------------|---------------|---------------|-------------------------|-------------------|
| HTTPS API   | 443           | 5000          | api.heart.lan           | heart-sms-backend |
| Gotify      | 443           | 8080          | push.heart.lan          | heart-sms-push    |
| Web client  | 443           | 8081          | web.heart.lan           | heart-sms-web     |
| MYSQL       | INTERNAL ONLY | 3306          | INTERNAL ONLY           | heart-sms-db      |
| Caddy       | 443 / 80      | -             | -                       | caddy             |

*Note: the reverse proxy (Caddy) listens on port 80 and 443, but only uses 80 to upgrade to HTTPS*

## URLs
Heart uses the following URLs in the following way (example urls are given, you will have your own, but they will probably be similar). Keep in mind that all URLs will lead to the same IP address (the containers are all running on the same server).

#### api.heart.lan

Open ports: 
  - 80 (optional, should always redirect to HTTPS API)
  - 443 (HTTPS API)


#### web.heart.lan

Open ports:
  - 80 (optional, should always redirect to HTTPS)
  - 443 (HTTPS)


#### push.heart.lan

Open ports:
  - 80 (optional, should always redirect to HTTPS)
  - 443 (HTTPS)


## Prerequisites

1. Please make sure you have git, docker, and docker-compose installed.
2. You must have a domain name.
3. You must generate a wildcard certificate signed by a CA for your domain (so it works for the web.* , api.* , and push.* subdomains). You can use certbot for this.


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
HEART_USE_SSL=true

# Limit user signups
# Wildcard (allow all users): *
# Or specify each user separated by commas (no spaces)
HEART_ALLOWED_USERS=*

# Gotify admin password
GOTIFY_DEFAULTUSER_PASS=MyNewSecureGotifyPassword
```

You can limit which usernames can be used to sign up to HeartSMS. For instance:
```
HEART_ALLOWED_USERS=test@email.com,user2,alphatester@email.com
```

**Make sure the permissions for your .env and certificate files are appropriate on the host!**

### Certificates

**Caddy**

Copy `Caddyfile.example` to `Caddyfile` and update the resulting `Caddyfile` with your own URLs. Then, change the `tls internal` line to read:
```
tls /etc/ssl/certs/cert.crt /etc/ssl/certs/key.key
```

**Make sure the permissions for your .env and certificate files are appropriate on the host!**


### Start the containers

You're ready!

```
docker-compose up -d
```

This will create the entire stack with all the containers for you, ready to go.

The encrypted API, Gotify/UnifiedPush server, web client, and websocket endpoints are now available on the internet!

Unfortunately, that is it for now; the Android app is not yet fully functional. See the `heart-sms-android` repo for build instructions.
