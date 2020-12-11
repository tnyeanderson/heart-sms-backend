# pulse-sms-backend
TChilderhose implemented nearly all of this backend before giving me his code to use as reference. Thank you!

### API Endpoints
Checked means "tested working", hash means not needed, and a tilde means the code is present but I haven't tested it yet.

- [ ] # accounts/ (original api fails on this request)
- [ ] accounts/login
- [ ] accounts/signup
- [ ] accounts/remove_account
- [ ] accounts/clean_account
- [ ] accounts/count
- [ ] accounts/settings
- [ ] accounts/update_setting
- [ ] accounts/dismissed_notification
- [ ] accounts/view_subscription
- [ ] # accounts/update_subscription
- [ ] activate
- [ ] auto_replies/
- [ ] auto_replies/add
- [ ] auto_replies/remove/{device_id}
- [ ] auto_replies/update/{device_id}
- [ ] # beta/register
- [ ] # beta/remove
- [ ] blacklists/
- [ ] blacklists/add
- [ ] blacklists/remove/{device_id}
- [ ] contacts/
- [ ] contacts/add
- [ ] contacts/update_device_id
- [ ] contacts/remove_device_id
- [ ] contacts/clear
- [ ] contacts/simple
- [ ] contacts/remove_ids
- [ ] conversations/
- [ ] conversations/add
- [ ] conversations/update/{device_id}
- [ ] conversations/update_snippet/{device_id}
- [ ] conversations/update_title/{device_id}
- [ ] conversations/remove/{device_id}
- [ ] conversations/read/{device_id}
- [ ] conversations/seen
- [ ] conversations/seen/{device_id}
- [ ] conversations/archive/{device_id}
- [ ] conversations/unarchive/{device_id}
- [ ] conversations/add_to_folder/{device_id}
- [ ] conversations/remove_from_folder/{device_id}
- [ ] # conversations/clean (included in Android app, but this endpoint is never called from any clients)
- [ ] converstaions/cleanup_messages
- [ ] devices/
- [ ] devices/add
- [ ] devices/update/{id}
- [ ] devices/remove/{id}
- [ ] devices/update_primary
- [ ] drafts/
- [ ] drafts/add
- [ ] drafts/update/{device_id}
- [ ] drafts/remove/{device_conversation_id}
- [ ] drafts/replace/{device_conversation_id} (different clients use replace vs update)
- [ ] folders/
- [ ] folders/add
- [ ] folders/remove/{device_id}
- [ ] folders/update/{device_id}
- [ ] media/
- [ ] messages/
- [ ] messages/remove/{device_id}
- [ ] messages/add/
- [ ] messages/update/{device_id}
- [ ] messages/update_type/{device_id}
- [ ] messages/cleanup
- [ ] messages/forward_to_phone
- [ ] purchases/record
- [ ] scheduled_messages/
- [ ] scheduled_messages/add
- [ ] scheduled_messages/update/{device_id}
- [ ] scheduled_messages/remove/{device_id}
- [ ] stream (websockets)
- [ ] templates/
- [ ] templates/add
- [ ] templates/remove/{device_id}
- [ ] templates/update/{device_id}


## Firebase

Long term, firebase should be discarded for pure websockets.

The `/media/{id}` endpoint was used to query Firebase for the image stored by ID. Media is actually stored on Firebase.

Upon sending, the client generates an ID and pushes the encrypted media file to firebase by ID. Once added, it sends a `messages/add` request to the server, storing the generated ID as the `DeviceId`, and Data set to `firebase -1` (encrypted).

(For some reason, DeviceId seems to be the MessageId in the table? Investigate)

From `DataSource.kt` (investigate):

> The num at the end is used for making the initial upload (20 will be done the first time) and so if that num is < 20 on the downloading side it means that there won't actually be an image for it and we shouldn't try to download. After the initial upload, we should use "firebase -1" to indicate that the image will be available for download.


We should:

- [ ] Create a new table in the DB for "Media", joined to `Messages`, cascading, with FK=`DeviceId`
- [ ] Have the `/media` endpoint lookup the Data column (blob) from the Media table by `DeviceId`
- [ ] Change `downloadFileFromFirebase()` or equivalent functions in all clients to be queries to `/media`

Some firebase messages are implemented here but commented out to prevent errors. Here are the firebase actions from the Android app:

- [ ] removed_account
- [ ] updated_account
- [ ] cleaned_account
- [ ] added_message
- [ ] update_message_type
- [ ] updated_message
- [ ] removed_message
- [ ] cleanup_messages
- [ ] cleanup_conversation_messages
- [ ] added_contact
- [ ] updated_contact
- [ ] removed_contact
- [ ] removed_contact_by_id
- [ ] added_conversation
- [ ] update_conversation_snippet
- [ ] update_conversation_title
- [ ] updated_conversation
- [ ] removed_conversation
- [ ] read_conversation
- [ ] seen_conversation
- [ ] archive_conversation
- [ ] seen_conversations
- [ ] added_draft
- [ ] replaced_drafts
- [ ] removed_drafts
- [ ] added_blacklist
- [ ] removed_blacklist
- [ ] added_scheduled_message
- [ ] updated_scheduled_message
- [ ] removed_scheduled_message
- [ ] added_folder
- [ ] add_conversation_to_folder
- [ ] remove_conversation_from_folder
- [ ] updated_folder
- [ ] removed_folder
- [ ] added_template
- [ ] updated_template
- [ ] removed_template
- [ ] added_auto_reply
- [ ] updated_auto_reply
- [ ] removed_auto_reply
- [ ] update_setting
- [ ] dismissed_notification
- [ ] update_subscription
- [ ] update_primary_device
- [ ] feature_flag
- [ ] forward_to_phone

