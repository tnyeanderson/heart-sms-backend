# Gotify / UnifiedPush

The docker-compose file contains a Gotify server, which should be connected to the Gotify-UP Android app on the user's phone. Websocket endpoint exists for web.

## Connecting

You can use `wscat` to connect to the websocket endpoint of Gotify.
```bash
wscat -nc wss://push.heart.lan/stream?token=YOUR-CLIENT-TOKEN
```

Now you will receive JSON-formatted messages anytime something happens. The actual data used in each message is stored in the `.extras['heartsms::realtime']` member of each JSON object.


Message data takes the following form (formatted for readability):
```
{
    "operation": STRING,
    "content": OBJECT
}
```

For instance:
```
{"operation":"forward_to_phone","content":{"to":"5555555555","message":"test","mime_type":"text/plain","sent_device":0}}
```

*THIS EXAMPLE WAS CHOSEN BECAUSE forward_to_phone WAS ACTUALLY SENDING UNENCRYPTED DATA IN PULSE!!! This has been fixed in Heart, and your data is encrypted now :)*


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

Content:
```
{
    "id": STRING,
    "real_name": STRING,
    "phone_number": STRING
}
```


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
    "from": STRING?,
    "color": INT?,
    "sent_device": INT?,
    "sim_stamp": STRING?
}
```
*NOTE: sim_stamp is sent by firebase but never parsed in any clients*


---


### update_message_type

Content:
```
{
    "id": STRING,
    "message_type": STRING
}
```

*id and message_type are originally strings according to prod... they are cast to INT in-app*


---


### updated_message

Content:
```
{
    "id": INT,
    "type": INT?,
    "timestamp": TIMESTAMP?,
    "read": BOOL?,
    "seen": BOOL?
}
```
*NOTE: read and seen are sent (even as nullable) by firebase but are not parsed anywhere*



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

*It appears android app will overwrite with null value (or throw) if a value is not present!! But webapp does not always push values!!*

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
    "ringtone": STRING?,
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
    android_device: STRING?
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
*TODO: should optional params phone_number and phrase be empty strings or null when not set?*



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

Content:
```
{
    pref: STRING,
    type: STRING,
    value: ANY
}
```



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
