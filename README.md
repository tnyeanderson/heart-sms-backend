# heart-sms-backend

This project provides a database and API backend for HeartSMS, a fork of PulseSMS. Written in NodeJS.

**Heart** is a text messaging app for android that lets you text from your browser on any computer. Whenever you receive or send a text on your phone, it is encrypted (along with certain metadata) on the client, sent to the backend (this repo), and stored in a database. The web client can use this database via its associated API (plus MQTT messaging) to read and respond to SMS messages in real time from any modern browser. When you hit send in the browser, it sends a request to your android phone to actually send the message. This means that you keep your phone number.

Your messages are yours. Heart does not collect any analytics data (or any data whatsoever), and the backend is meant to be self hosted.

None of this would be possible without the work of Luke Klinker and TChilderhose.

TChilderhose implemented *so* much of this backend (in C#) before giving me his code to use for reference. Thank you!

Check the `TODO.md` file for current state and future plans.

Eventually the rebranded Heart SMS app will be released on F-Droid, etc.

The end goal is a docker-compose file that can be initialized with environment variables, including the web client. Native clients will have preferences added to set the base url of the API.

Heart does not use Firebase Messaging. Instead, it has an MQTT broker (mosquitto) included, which is accessible on websockets for the web client.

---

# Build and run

For a detailed guide, see [Getting Started](docs/getting-started.md)

Here's the short version:

1. Clone the repo
2. Quickly create your `api` and `db` env files
3. Generate certificates using certbot (or your own CA for testing)
4. Update URLs and cert paths in Caddyfile
5. Mount the certs to the `heart-sms-mqtt` container
6. `docker-compose up -d`
7. `caddy run`


## SSL/TLS for testing

It is highly recommended that you use TLS and SSL even when you are testing. The current de facto testing domains are:
```
web.heart.lan
api.heart.lan
mqtt.heart.lan
```

You can simply edit your `/etc/hosts` file to have a line like this:
```
127.0.0.1 localhost api.heart.lan web.heart.lan mqtt.heart.lan
```

Then you should generate a wildcard certificate for `*.heart.lan` (I use my PFSense CA for this, but you can use `openssl`).

Then start caddy from the project root to get SSL/TLS *almost* everywhere:
```
caddy run
```

*Note: When testing the web interface, be sure to navigate to api.heart.lan in your browser to accept the self signed certificate first! Otherwise API calls will not go through*

The last place you need encryption is the MQTT broker (mosquitto). See the see [MQTTS - SSL/TLS Setup](mqtt.md) and [Getting Started - Mosquitto](getting-started.md) for instructions on how to set up.



## Development server

Follow the steps in [Contributing to HeartSMS](CONTRIBUTING.md) to set up a development server for tinkering.


## Docker

This project uses 4 bespoke containers to make configuration easy. Just create/edit the `.db.env` and `.api.env` files, add the certs and you're ready to go!

If you want to build the production containers yourself (might be a good idea if you are testing certain things because I don't have CI/CD in place... yet), you can do so in the following way:

### heart-sms-backend

From project root, run:
```
npm run docker:build
```

This will create a container tagged `heartsms/heart-sms-backend:dev`.

### heart-sms-web

Clone the `heart-sms-web` repo, then run from web project root:
```
npm run docker:build
```

This will create a container tagged `heartsms/heart-sms-web:dev`.

### heart-sms-db
```
cd ./db

sudo docker build -t heartsms/heart-sms-db:dev .
```

### heart-sms-mqtt
```
cd ./mqtt

sudo docker build -t heartsms/heart-sms-mqtt:dev .
```


## The following is from TChilderhose (edited)

*TChilderhose put a lot of work in to a C# backend, and gave me the confidence to take this on. Thanks!*

When Pulse SMS was [bought by Maple Media](https://www.androidpolice.com/2020/10/29/it-looks-like-pulse-sms-has-been-bought-by-maple-media-get-ready-for-intrusive-ads/), I started working on a backend that I could selfhost and just fork the android client, manually swap the urls and keys and use that.

Eventually Maple Media made the repo private, so I stopped working on it because I don't have time to do upkeep on the android side of stuff. So I figured I would dump my findings and some initial code that I was working on.

Findings
- `pulse-sms-android`
  - There are inconsistencies with naming and case. Sometimes it expects camelcase, sometimes it expect snake case
  - (THIS HAS BEEN FIXED IN HEARTSMS) It does seem to be E2EE, but the `api/v1/accounts/signup` and `api/v1/accounts/login` are sending the password in plain text... So in theory they could be storing that password when you login, and then they have everything they need (password and salt2) to decrypt the messages. My recommendation would be to first hash the password on the client when sending the signup and login requests (continue to hash it on the server as well) and continue to use the raw password with `salt2` to generate the E2EE key. That way the server can't decrypt the messages no matter what.
  - (HEARTSMS USES PURE WEBSOCKETS, NOT FIREBASE) It uses Firebase data messages to share data between clients. It works well, but also means it's reliant on Google services
  
Setup
- `pulse-sms-android`
  - Most likely you'll be starting out without any certificate on your webserver, so android will need some config to allow that.
    Add the file `pulse-sms-android\app\src\main\res\xml\security_config.xml` with
    ```
    <?xml version="1.0" encoding="utf-8"?>
    <network-security-config>
        <base-config cleartextTrafficPermitted="true">
            <trust-anchors>
                <certificates src="system" />
            </trust-anchors>
        </base-config>
    </network-security-config>
    ```
    and add `android:networkSecurityConfig="@xml/security_config"` to the `pulse-sms-android\app\src\main\AndroidManifest.xml` file in the `application` block (around line 83)
  - In `pulse-sms-android\api\src\main\java\xyz\klinker\messenger\api\Api.java` replace `API_DEBUG_URL` or `API_RELEASE_URL` with the url you are going to be using. I say `API_RELEASE_URL` because a bunch of code needs to be uncommented/changed to get the debug url to be used.
  - For Firebase, there are a lot of guides around, to set it up in the google console. But the idea is you set it up, grab the `google-services.json` it gives you and replace all of them in the app you can find. You will also need ot replace the `FIREBASE_STORAGE_URL` in `pulse-sms-android\api_implementation\src\main\java\xyz\klinker\messenger\api\implementation\ApiUtils.kt`
  - Go to `pulse-sms-android\api_implementation\src\main\java\xyz\klinker\messenger\api\implementation\LoginActivity.java` and in `setUpInitialLayout` comment out the if statement in there so that it doesn't disable signups (eventually I was going to strip all of the IAP code)
