# pulse-sms-backend
TChilderhose implemented nearly all of this backend before giving me his code to use as reference. Thank you!

### Security

There are some rather large security issues with the original pulse app and API. In fact, calling the app end-to-end encrypted would be, in my estimation, fraudulent.

A "check" means that this security issue has been resolved

- [x] Passwords are sent in plain text, meaning the server has everything it needs (password + Salt2) to get the encryption key and decrypt all message data. We should hash before AND after sending (`/signup` and `/login`)
- [ ] There is no authentication/sessions of any kind for the API or websockets. It is all based on knowledge of the account ID, which is returned during login but never changes (and can't be changed by the user). One could clear out and even delete an account if they know the account ID. ID length has been increased to 64 characters for Heart, but some sort of session key should be implemented instead.
- [x] When creating a new conversation/thread, the message metadata and contents are sent *unencrypted* in PLAIN TEXT!
- [ ] For a self-hosted solution, we should have a whitelist of allowed accounts to prevent third-party use of a private server

### API Endpoints
Checked means "test written and passing", tilde means the endpoint sends a websocket (untested)

- [x] accounts/login
- [x] accounts/signup
- [x] accounts/remove_account
- [x] accounts/clean_account
- [x] accounts/count
- [x] accounts/settings
- [ ] accounts/update_setting
- [ ] ~ accounts/dismissed_notification
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
- [x] media/
- [x] media/add
- [x] messages/
- [x] messages/remove/{device_id}
- [x] messages/add/
- [x] messages/update/{device_id}
- [x] messages/update_type/{device_id}
- [x] messages/cleanup
- [x] ~ messages/forward_to_phone
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

- [x] Create a new table in the DB for "Media", joined to `Messages`, cascading, with FK=`DeviceId`
- [x] Have the `/media` endpoint lookup the Data column (blob) from the Media table by `DeviceId`
- [x] Change `downloadFileFromFirebase()` or equivalent functions in all clients to be queries to `/media`
  - [x] Web client (already uses /media endpoint)
  - [x] Android app
- [x] Change `uploadFileToFirebase()` or equivalent functions in all clients to be queries to `/media`
  - [x] Web client (happens in `media.send()` in `messages.js`)
  - [x] Android app


## Websockets
Firebase messages are being scrapped for pure websockets. Here are the firebase actions from the Android app, and their websocket implementation status (untested):

- [x] removed_account
- [ ] updated_account
- [x] cleaned_account
- [x] added_message
- [x] update_message_type
- [x] updated_message
- [x] removed_message
- [x] cleanup_messages
- [x] cleanup_conversation_messages
- [x] added_contact
- [x] updated_contact
- [x] removed_contact
- [x] removed_contact_by_id
- [x] added_conversation
- [x] update_conversation_snippet
- [x] update_conversation_title
- [x] updated_conversation
- [x] removed_conversation
- [x] read_conversation
- [x] seen_conversation
- [x] archive_conversation
- [x] seen_conversations
- [x] added_draft
- [x] replaced_drafts
- [x] removed_drafts
- [x] added_blacklist
- [x] removed_blacklist
- [x] added_scheduled_message
- [x] updated_scheduled_message
- [x] removed_scheduled_message
- [x] added_folder
- [x] add_conversation_to_folder
- [x] remove_conversation_from_folder
- [x] updated_folder
- [x] removed_folder
- [x] added_template
- [x] updated_template
- [x] removed_template
- [x] added_auto_reply
- [x] updated_auto_reply
- [x] removed_auto_reply
- [ ] update_setting
- [x] dismissed_notification
- [x] # update_subscription
- [x] update_primary_device
- [x] # feature_flag
- [x] forward_to_phone

