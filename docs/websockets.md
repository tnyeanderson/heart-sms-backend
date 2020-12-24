# Websockets

Local websocket URL: `ws:localhost:5050/stream?account_id=STRING`

*An account_id MUST be included.*


## Connecting

On connection to the websocket, the following message will be received by the client:
```
{"type":"welcome"}
```

From this point on, the server sends a ping (with a ten-digit timestamp) to all clients every 3 seconds. For example:
```
{"type":"ping","message":1608150458}
```

To subscribe to notifications, send:
```
{"command":"subscribe","identifier":"{\"channel\":\"NotificationsChannel\"}"}
```

Which should respond with confirmation:
```
{"identifier":"{\"channel\":\"NotificationsChannel\"}","type":"confirm_subscription"}
```

Now you will receive messages anytime something happens. Messages take the following form (formatted for readability):
```
{
    "identifier": "{\"channel\":\"NotificationsChannel\"}",
    "message": {
        "operation": STRING,
        "content": OBJECT
    }
}
```

For instance:
```
{"identifier":"{\"channel\":\"NotificationsChannel\"}","message":{"operation":"forward_to_phone","content":{"to":"5555555555","message":"test","mime_type":"text/plain","sent_device":0}}}
```

*THIS EXAMPLE WAS CHOSEN BECAUSE forward_to_phone IS ACTUALLY SENDING UNENCRYPTED DATA IN PULSE!!! This will be fixed before release :)*


## Operations

---
### removed_account

Content:
```
{
    "id": STRING
}
```



---


### updated_account
### cleaned_account

Content:
```
{
    "id": STRING
}
```



---


### added_message

Content:
```
{
    "id": INT,
    "conversation_id": INT,
    "type": INT,
    "data": STRING,
    "timestamp": TIMESTAMP,
    "mime_type": STRING,
    "read": BOOL,
    "seen": BOOL,
    "from": STRING,
    "color": INT,
    "sent_device": INT,
    "sim_stamp": INT
}
```



---


### update_message_type

Content:
```
{
    "id": STRING,
    "message_type": INT
}
```

*message_type is originally a string here (which is cast to INT in-app)*


---


### updated_message

Content:
```
{
    "id": INT,
    "type": INT,
    "timestamp": TIMESTAMP,
    "read": BOOL,
    "seen": BOOL
}
```



---


### removed_message

Content:
```
{
    "id": STRING
}
```



---


### cleanup_messages

Content:
```
{
    "timestamp": TIMESTAMP
}
```



---


### cleanup_conversation_messages

Content:
```
{
    "timestamp": TIMESTAMP,
    "conversation_id": STRING
}
```



---


### added_contact

Content:
```
{
    "phone_number": STRING,
    "name": STRING,
    "color": INT,
    "color_dark": INT,
    "color_light": INT,
    "color_accent": INT,
    "type": INT
}
```



---


### updated_contact

Content:
```
{
    "device_id": INT,
    "phone_number": STRING,
    "name": STRING,
    "color": INT,
    "color_dark": INT,
    "color_light": INT,
    "color_accent": INT,
    "type": INT
}
```



---


### removed_contact

Content:
```
{
    "device_id": INT,
    "phone_number": STRING
}
```



---


### removed_contact_by_id

Content:
```
{
    "id": STRING
}
```

*ids is a single id or a comma separated list of contact ids (NOT device_ids)*



---


### added_conversation

Content:
```
{
    "device_id": INT,
    "folder_id": INT,
    "color": INT,
    "color_dark": INT,
    "color_light": INT,
    "color_accent": INT,
    "led_color": INT,
    "pinned": BOOL,
    "read": BOOL,
    "timestamp": TIMESTAMP,
    "title": STRING,
    "phone_numbers": STRING,
    "snippet": STRING,
    "ringtone": STRING?,
    "image_uri": STRING?,
    "id_matcher": STRING,
    "mute": BOOL,
    "archive": BOOL,
    "private_notifications": BOOL
}
```

*ids is a single id or a comma separated list of contact ids (NOT device_ids)*



---


### update_conversation_snippet

Content:
```
{
    id: INT,
    read: BOOL,
    timestamp: TIMESTAMP,
    snippet: STRING,
    archive: BOOL
}
```



---


### update_conversation_title

Content:
```
{
    id: INT,
    title: STRING
}
```



---


### updated_conversation

*TODO: appears android app will overwrite with null value (or throw) if a value is not present!! But webapp does not always push values!!*

Content:
```
{
    "id": INT,
    "color": INT,
    "color_dark": INT,
    "color_light": INT,
    "color_accent": INT,
    "led_color": INT,
    "pinned": BOOL,
    "read": BOOL,
    "title": STRING,
    "snippet": STRING,
    "ringtone": STRING,
    "mute": BOOL,
    "archive": BOOL,
    "private_notifications": BOOL
}
```



---


### removed_conversation

Content:
```
{
    id: INT
}
```



---


### read_conversation

Content:
```
{
    id: INT,
    android_device: STRING?
}
```

*android_device is set to a device id and is used to prevent re-reading on the android app in FirebaseHandler.kt*



---


### seen_conversation

Content:
```
{
    id: INT
}
```



---


### archive_conversation

Content:
```
{
    id: INT,
    archive: BOOL
}
```



---


### seen_conversations

Content:
```
{}
```



---


### added_draft

Content:
```
{
    id: INT,
    conversation_id: INT,
    data: STRING,
    mime_type: STRING
}
```



---


### replaced_drafts

Content:
```
{
    id: INT,
    conversation_id: INT,
    data: STRING,
    mime_type: STRING
}
```



---


### removed_drafts

Content:
```
{
    id: INT,
    android_device: INT
}
```

*id is a device_conversation_id*

*android_device is set to a device id and is used to prevent re-reading on the android app in FirebaseHandler.kt*



---


### added_blacklist

Content:
```
{
    "id": INT,
    "phone_number": STRING,
    "phrase": STRING
}
```



---


### removed_blacklist

Content:
```
{
    id: INT
}
```



---


### added_scheduled_message

Content:
```
{
    "id": INT,
    "to": STRING,
    "data": STRING,
    "mime_type": STRING,
    "timestamp": TIMESTAMP,
    "title": STRING,
    "repeat": INT
}
```



---


### updated_scheduled_message

Content:
```
{
    "id": INT,
    "to": STRING,
    "data": STRING,
    "mime_type": STRING,
    "timestamp": TIMESTAMP,
    "title": STRING,
    "repeat": INT
}
```



---


### removed_scheduled_message

Content:
```
{
    id: INT
}
```



---


### added_folder

Content:
```
{
    device_id: INT,
    name: STRING,
    color: INT,
    color_dark: INT,
    color_light: INT,
    color_accent: INT
}
```



---


### add_conversation_to_folder

Content:
```
{
    id: INT,
    folder_id: INT
}
```



---


### remove_conversation_from_folder

Content:
```
{
    id: INT
}
```



---


### updated_folder

Content:
```
{
    device_id: INT,
    name: STRING,
    color: INT,
    color_dark: INT,
    color_light: INT,
    color_accent: INT
}
```



---


### removed_folder

Content:
```
{
    id: INT
}
```



---


### added_template

Content:
```
{
    device_id: INT,
    text: STRING
}
```



---


### updated_template

Content:
```
{
    device_id: INT,
    text: STRING
}
```



---


### removed_template

Content:
```
{
    id: INT
}
```



---


### added_auto_reply

Content:
```
{
    device_id: INT,
    type: STRING,
    pattern: STRING,
    response: STRING
}
```



---


### updated_auto_reply

Content:
```
{
    device_id: INT,
    type: STRING,
    pattern: STRING,
    response: STRING
}
```



---


### removed_auto_reply

Content:
```
{
    id: INT
}
```



---


### update_setting



---


### dismissed_notification

`id` refers to a device_conversation_id

Content:
```
{
    "id": STRING,
    "device_id": STRING?
}
```


---



### update_primary_device

Content:
```
{
    "new_primary_device_id": STRING
}
```



---


### feature_flag

Not implemented. Used to roll out features for A/B testing.



---


### forward_to_phone

Content:
```
{
    "to": STRING,
    "message": STRING,
    "mime_type": STRING?,
    "message_id": INT?,
    "sent_device": INT
}
```


## Intentionally not implemented

These messages were not implemented because the features are not supported in HeartSMS. Everyone has a lifetime subscription here :)

* update_subscription
