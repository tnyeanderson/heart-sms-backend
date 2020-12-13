# API Documentation

WORK IN PROGRESS... Most of these are "documented" in my archived `pulse-sms-backend` repo.

Base url is `/api/v1`



## Endpoints


### `/accounts`

Not Implemented (original api fails on this request)

---

### `/accounts/login`

Method: POST

Parameters: None

Request body:
```
{
    username: STRING,
    password: STRING
}
```

Response:
```
{
    "account_id": STRING,
    "salt1": STRING,
    "salt2": STRING,
    "phone_number": STRING,
    "name": STRING,
    "subscription_type": INT,
    "subscription_expiration": TIMESTAMP,
    "base_theme": STRING,
    "rounder_bubbles": BOOL,
    "global_color_theme": STRING,
    "color": INT,
    "color_dark": INT,
    "color_light": INT,
    "color_accent": INT,
    "use_global_theme": BOOL,
    "apply_primary_color_to_toolbar": BOOL,
    "passcode": STRING,
    "message_timestamp": BOOL,
    "conversation_categories": BOOL
} 
```

Error:
```
{
    "error": "username or password incorrect"
}
```


---


### `/accounts/signup`

Method: POST

Parameters: None

Request body:
```
{
	"name": STRING,
	"password": STRING,
	"phone_number": STRING,
	"real_name": STRING
}
```

Response:
```
<UNKNOWN>
```


---


### `/accounts/remove_account`

Method: POST

Parameters: `account_id`

Request body: None

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/accounts/clean_account`

Method: POST

Parameters: `account_id`

Request body: None

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/accounts/count`

Method: GET

Parameters: `account_id`

Request body: None

Response:
```
{
    "device_count": INT,
    "message_count": INT,
    "conversation_count": INT,
    "draft_count": INT,
    "scheduled_count": INT,
    "blacklist_count": INT,
    "contact_count": INT,
    "template_count": INT,
    "folder_count": INT,
    "auto_reply_count": INT
}
```

Error:
```
<UNKNOWN>
```


---


### `/accounts/settings`

Method: GET

Parameters: `account_id`

Request body: None

Response:
```
{
    "base_theme": STRING,
    "global_color_theme": STRING,
    "rounder_bubbles": BOOL,
    "color": INT,
    "color_dark": INT,
    "color_light": INT,
    "color_accent": INT,
    "use_global_theme": BOOL,
    "apply_primary_color_to_toolbar": BOOL,
    "passcode": STRING,
    "subscription_type": INT,
    "message_timestamp": BOOL,
    "conversation_categories": BOOL
}
```

Error:
```
<UNKNOWN>
```


---


### `/accounts/update_setting`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/accounts/dismissed_notification`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/accounts/view_subscription`

Method: GET

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/accounts/update_subscription`

Not Implemented


### `/activate`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/auto_replies`

Method: GET

Parameters: `account_id`

Request body: None

Response:
```
[
    {
        "id": INT,
        "account_id": STRING,
        "device_id": INT,
        "reply_type": STRING,
        "pattern": STRING,
        "response": STRING
    }
    ...
]
```

Error:
```
<UNKNOWN>
```


---


### `/auto_replies/add`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/auto_replies/remove/{device_id}`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/auto_replies/update/{device_id}`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/beta/register`

Not Implemented


---


### `/beta/remove`

Not Implemented


---


### `/blacklists`

Method: GET

Parameters: `account_id`

Request body: None

Response:
```
[
    {
        "id": INT,
        "account_id": STRING,
        "device_id": INT,
        "phone_number": STRING,
        "phrase": STRING
    }
    ...
]
```

Error:
```
<UNKNOWN>
```


---


### `/blacklists/add`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/blacklists/remove/{device_id}`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/contacts`

Method: GET

Parameters: `account_id`

Request body: None

Response:
```
[
    {
        "id": INT,
        "account_id": STRING,
        "device_id": INT,
        "phone_number": STRING,
        "name": STRING,
        "color": INT,
        "color_dark": INT,
        "color_light": INT,
        "color_accent": INT,
        "contact_type": INT
    }
    ...
]
```

Error:
```
<UNKNOWN>
```


---


### `/contacts/add`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/contacts/update_device_id`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/contacts/remove_device_id`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/contacts/clear`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/contacts/simple`

Method: GET

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
[
    {
        "phone_number": STRING,
        "name": STRING,
        "id": INT,
        "id_matcher": STRING,
        "color": INT,
        "color_accent": INT,
        "contact_type": INT
    }
    ...
]
```

Error:
```
<UNKNOWN>
```


---


### `/contacts/remove_ids`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/conversations`

Method: GET

Parameters: `account_id`

Request body: None

Response:
```
[
    {
        "id": INT,
        "account_id": STRING,
        "device_id": INT,
        "folder_id": INT,
        "color": INT,
        "color_dark": INT,
        "color_light": INT,
        "color_accent": INT,
        "led_color": INT,
        "pinned": BOOL,
        "read": BOOL,
        "timestamp": INT,
        "title": STRING,
        "phone_numbers": STRING,
        "snippet": STRING,
        "ringtone": UNKNOWN,
        "image_uri": STRING,
        "id_matcher": STRING,
        "mute": BOOL,
        "archive": BOOL,
        "private_notifications": BOOL
    }
    ...
]
```

Error:
```
<UNKNOWN>
```


---


### `/conversations/add`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/conversations/update/{device_id}`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/conversations/update_snippet/{device_id}`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/conversations/update_title/{device_id}`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/conversations/remove/{device_id}`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/conversations/read/{device_id}`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/conversations/seen`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/conversations/seen/{device_id}`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/conversations/archive/{device_id}`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/conversations/unarchive/{device_id}`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/conversations/add_to_folder/{device_id}`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/conversations/remove_from_folder/{device_id}`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/conversations/clean`

Not Implemented (included in Android app, but this endpoint is never called from any clients)


---


### `/converstaions/cleanup_messages`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/devices`

Method: GET

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
[
    {
        "id": INT,
        "info": STRING,
        "name": STRING,
        "primary": BOOL,
        "account_id": STRING,
        "fcm_token": STRING,
        "ios": BOOL
    }
    ...
]
```

Error:
```
<UNKNOWN>
```


---


### `/devices/add`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/devices/update/{id}`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/devices/remove/{id}`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/devices/update_primary`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/drafts`

Method: GET

Parameters: `account_id`

Request body: None

Response:
```
[
    {
        "id": INT,
        "account_id": STRING,
        "device_id": INT,
        "device_conversation_id": INT,
        "data": STRING,
        "mime_type": STRING
    }
    ...
]
```

Error:
```
<UNKNOWN>
```


---


### `/drafts/add`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/drafts/update/{device_id}`

*Different clients use replace vs update*

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/drafts/remove/{device_conversation_id}`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
{}
```

Error:
```
{}
```


---


### `/drafts/replace/{device_conversation_id}`

*Different clients use replace vs update*

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/folders`

Method: GET

Parameters: `account_id`

Request body: None

Response:
```
[
    {
        "id": INT,
        "account_id": STRING,
        "device_id": INT,
        "name": STRING,
        "color": INT,
        "color_light": INT,
        "color_dark": INT,
        "color_accent": INT
    }
    ...
]
```

Error:
```
<UNKNOWN>
```


---


### `/folders/add`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/folders/remove/{device_id}`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/folders/update/{device_id}`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/media`

Method: GET

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/messages`

Method: GET

Parameters: `account_id`

Request body: None

Response:
```
[
    {
        "id": INT,
        "account_id": STRING,
        "device_id": INT,
        "device_conversation_id": INT,
        "message_type": INT,
        "data": STRING,
        "timestamp": INT,
        "mime_type": STRING,
        "read": BOOL,
        "seen": BOOL,
        "message_from": STRING,
        "color": INT,
        "sent_device": INT,
        "sim_stamp": UNKNOWN
    }
    ...
]
```

Error:
```
<UNKNOWN>
```


---


### `/messages/remove/{device_id}`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/messages/add`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/messages/update/{device_id}`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/messages/update_type/{device_id}`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/messages/cleanup`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/messages/forward_to_phone`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/purchases/record`

Method: <UNKNOWN>

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/scheduled_messages`

Method: GET

Parameters: `account_id`

Request body: None

Response:
```
[
    {
        "id": INT,
        "account_id": STRING,
        "device_id": INT,
        "to": STRING,
        "data": STRING,
        "mime_type": STRING,
        "timestamp": INT,
        "title": STRING,
        "repeat": INT
    }
    ...
]
```

Error:
```
<UNKNOWN>
```


---


### `/scheduled_messages/add`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/scheduled_messages/update/{device_id}`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/scheduled_messages/remove/{device_id}`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/stream`

Websockets

Parameters: `account_id`


---


### `/templates`

Method: GET

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/templates/add`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/templates/remove/{device_id}`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


---


### `/templates/update/{device_id}`

Method: POST

Parameters: `account_id`

Request body: <UNKNOWN>

Response:
```
<UNKNOWN>
```

Error:
```
<UNKNOWN>
```


