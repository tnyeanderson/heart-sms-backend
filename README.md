# heart-sms-backend

This project provides a database and API backend for HeartSMS, a fork of PulseSMS. Written in NodeJS.

None of this would be possible without the work of Luke Klinker and TChilderhose.

TChilderhose implemented *so* much of this backend (in C#) before giving me his code to use for reference. Thank you!

Check the `TODO.md` file for current state and future plans.

Eventually the rebranded Heart SMS app will be released on F-Droid, etc.

The end goal is a docker-compose file that can be initialized with environment variables, including the web client. Native clients will have preferences added to set the base url of the API.

---

# Build and run

Make sure you have docker installed, then:
```
git clone git@github.com:tnyeanderson/heart-sms-backend.git

cd heart-sms-backend

cp .db.env.example .db.env

# EDIT THE .db.env FILE TO CHANGE THE USER PASSWORD

docker-compose up -d
```

This will give you the full development stack: the database, API, and web interface.

Currently, the API and web interface are served over HTTP. Eventually a reverse proxy will be added to the docker stack to provide SSL.

Change any variables in `docker-compose.yml` as needed.

At the moment the web interface requires a lot of work as many dependencies are outdated/deprecated. See the `TODO.md` file in `heart-sms-web`


## Run test suite

Right now the testing is pretty dirty, but it seems to work alright for now. To run the tests:

```
npm run test
```

Once the test server starts, you will be given 3 seconds to open up a websocket connection by running the following command in another shell:

```
wscat -c localhost:5051/api/v1/stream?account_id=test
```

The `test` account is only available when `NODE_ENV=test`, and it receives all websocket messages sent to any user. It does not require a subscription string.

You can look over the stream manually and check against `docs/websockets.md`. Tests need to be written for receiving the websocket messages. (The responses look good as of this commit by my error-prone eyes)


## The following is from TChilderhose (edited)

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
