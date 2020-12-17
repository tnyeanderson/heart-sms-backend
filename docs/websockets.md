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
### update_conversation_snippet
### update_conversation_title
### updated_conversation
### removed_conversation
### read_conversation
### seen_conversation
### archive_conversation
### seen_conversations
### added_draft
### replaced_drafts
### removed_drafts
### added_blacklist
### removed_blacklist
### added_scheduled_message
### updated_scheduled_message
### removed_scheduled_message
### added_folder
### add_conversation_to_folder
### remove_conversation_from_folder
### updated_folder
### removed_folder
### added_template
### updated_template
### removed_template
### added_auto_reply
### updated_auto_reply
### removed_auto_reply
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
