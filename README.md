# pulse-sms-backend

This project provides a database and API backend for Heart SMS, a fork of Pulse SMS. Written in NodeJS.

None of this would be possible without the work of Luke Klinker and TChilderhose.

TChilderhose implemented *so* much of this backend (in C#) before giving me his code to use for reference. Thank you!

Check the `TODO.md` file for current state and future plans.

Eventually (and hopefully soon) hard forks of the clients will be created, rebranded to Heart SMS with new logos et al, and released on F-Droid, etc.

The end goal is a docker-compose file that can be initialized with environment variables, including the web client. Native clients will have preferences added to set the base url of the API.

---

# Build and run

Make sure you have Node/npm installed, then:
```
git clone git@github.com:tnyeanderson/heart-sms-backend.git

cd heart-sms-backend

npm install

node server.js
```

At the moment, the database is not fully implemented. You can run the `docker-compose up -d` to start a mysql server (be sure to change the root password in `docker-compose.yml`). Then you can create the tables using `db/create_schema.sql`.

**THIS DATABASE WILL BE DELETED WHEN YOU REMOVE THE CONTAINER WITH `docker-compose down`**

Then configure the database connection by editing a copy of `db/connect.example.js`:
```
cp db/connect.example.js db/connect.js
```


## The following is from TChilderhose (edited)

When Pulse SMS was [bought by Maple Media](https://www.androidpolice.com/2020/10/29/it-looks-like-pulse-sms-has-been-bought-by-maple-media-get-ready-for-intrusive-ads/), I started working on a backend that I could selfhost and just fork the android client, manually swap the urls and keys and use that.

Eventually Maple Media made the repo private, so I stopped working on it because I don't have time to do upkeep on the android side of stuff. So I figured I would dump my findings and some initial code that I was working on.

Findings
- `pulse-sms-android`
  - There are inconsistencies with naming and case. Sometimes it expects camelcase, sometimes it expect snake case
  - It does seem to be E2EE, but the `api/v1/accounts/signup` and `api/v1/accounts/login` are sending the password in plain text... So in theory they could be storing that password when you login, and then they have everything they need (password and salt2) to decrypt the messages. My recommendation would be to first hash the password on the client when sending the signup and login requests (continue to hash it on the server as well) and continue to use the raw password with `salt2` to generate the E2EE key. That way the server can't decrypt the messages no matter what.
  - It uses Firebase data messages to share data between clients. It works well, but also means it's reliant on Google services
  
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
