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

### removed_account
### updated_account
### cleaned_account
### added_message
### update_message_type
### updated_message
### removed_message
### cleanup_messages
### cleanup_conversation_messages
### added_contact
### updated_contact
### removed_contact
### removed_contact_by_id
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
    id: STRING,
    device_id: STRING?
}
```


---


### update_subscription
### update_primary_device
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
