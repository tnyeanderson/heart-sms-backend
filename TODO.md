# pulse-sms-backend
TChilderhose implemented nearly all of this backend before giving me his code to use as reference. Thank you!

### API Endpoints
Checked means "test written and passing"

- [x] accounts/login
- [x] accounts/signup
- [x] accounts/remove_account
- [x] accounts/clean_account
- [x] accounts/count
- [x] accounts/settings
- [ ] accounts/update_setting
- [ ] accounts/dismissed_notification
- [ ] activate
- [x] auto_replies/
- [x] auto_replies/add
- [x] auto_replies/remove/{device_id}
- [x] auto_replies/update/{device_id}
- [x] blacklists/
- [x] blacklists/add
- [x] blacklists/remove/{device_id}
- [x] contacts/
- [x] contacts/add
- [x] contacts/update_device_id
- [x] contacts/remove_device_id
- [x] contacts/clear
- [x] contacts/simple
- [x] contacts/remove_ids
- [x] conversations
- [x] conversations/{device_id}
- [x] conversations/folder/{folder_id}
- [x] conversations/index_archived
- [x] conversations/index_private
- [x] conversations/index_public_unarchived
- [x] conversations/add
- [x] conversations/update/{device_id}
- [x] conversations/update_snippet/{device_id}
- [x] conversations/update_title/{device_id}
- [x] conversations/remove/{device_id}
- [x] conversations/read/{device_id}
- [x] conversations/seen
- [x] conversations/seen/{device_id}
- [x] conversations/archive/{device_id}
- [x] conversations/unarchive/{device_id}
- [x] conversations/add_to_folder/{device_id}
- [x] conversations/remove_from_folder/{device_id}
- [x] conversations/cleanup_messages
- [x] devices/
- [x] devices/add
- [x] devices/update/{id}
- [x] devices/remove/{id}
- [x] devices/update_primary
- [x] drafts
- [x] drafts/{device_conversation_id}
- [x] drafts/add
- [x] drafts/update/{device_id}
- [x] drafts/remove/{device_conversation_id}
- [x] drafts/replace/{device_conversation_id}
- [x] folders/
- [x] folders/add
- [x] folders/remove/{device_id}
- [x] folders/update/{device_id}
- [ ] media/
- [x] messages/
- [x] messages/remove/{device_id}
- [x] messages/add/
- [x] messages/update/{device_id}
- [x] messages/update_type/{device_id}
- [x] messages/cleanup
- [ ] messages/forward_to_phone
- [x] scheduled_messages/
- [x] scheduled_messages/add
- [x] scheduled_messages/update/{device_id}
- [x] scheduled_messages/remove/{device_id}
- [ ] stream (websockets)
- [x] templates/
- [x] templates/add
- [x] templates/remove/{device_id}
- [x] templates/update/{device_id}


### Intentionally not implemented

- [x] accounts (original api fails on this request, only appears in tests)
- [x] accounts/view_subscription
- [x] accounts/update_subscription
- [x] beta/register
- [x] beta/remove
- [x] conversations/clean (included in Android app, but this endpoint is never called from any clients)
- [x] purchases/record


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

