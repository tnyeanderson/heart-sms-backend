BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "Accounts" (
    "account_id" TEXT NOT NULL CONSTRAINT "PK_Accounts" PRIMARY KEY,
    "password_hash" TEXT NULL,
    "real_name" TEXT NULL,
    "salt1" TEXT NULL,
    "salt2" TEXT NULL,
    "phone_number" TEXT NULL,
    "name" TEXT NULL,
    "base_theme" TEXT NULL,
    "passcode" TEXT NULL,
    "rounder_bubbles" INTEGER NOT NULL,
    "use_global_theme" INTEGER NOT NULL,
    "apply_primary_color_to_toolbar" INTEGER NOT NULL,
    "conversation_categories" INTEGER NOT NULL,
    "message_timestamp" INTEGER NOT NULL,
    "color" INTEGER NOT NULL,
    "color_dark" INTEGER NOT NULL,
    "color_light" INTEGER NOT NULL,
    "color_accent" INTEGER NOT NULL,
    "global_color_theme" TEXT NULL
);
CREATE TABLE IF NOT EXISTS "AutoReplies" (
    "id" INTEGER NOT NULL CONSTRAINT "PK_AutoReplies" PRIMARY KEY AUTOINCREMENT,
    "device_id" INTEGER NOT NULL,
    "reply_type" TEXT NULL,
    "pattern" TEXT NULL,
    "response" TEXT NULL,
    "account_id" TEXT NULL,
    CONSTRAINT "FK_AutoReplies_Accounts_account_id" FOREIGN KEY ("account_id") REFERENCES "Accounts" ("account_id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "Blacklists" (
    "id" INTEGER NOT NULL CONSTRAINT "PK_Blacklists" PRIMARY KEY AUTOINCREMENT,
    "device_id" INTEGER NOT NULL,
    "phone_number" TEXT NULL,
    "phrase" TEXT NULL,
    "account_id" TEXT NULL,
    CONSTRAINT "FK_Blacklists_Accounts_account_id" FOREIGN KEY ("account_id") REFERENCES "Accounts" ("account_id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "Contacts" (
    "id" INTEGER NOT NULL CONSTRAINT "PK_Contacts" PRIMARY KEY AUTOINCREMENT,
    "phone_number" TEXT NULL,
    "id_matcher" TEXT NULL,
    "name" TEXT NULL,
    "contact_type" INTEGER NOT NULL,
    "account_id" TEXT NULL,
    "color" INTEGER NOT NULL,
    "color_dark" INTEGER NOT NULL,
    "color_light" INTEGER NOT NULL,
    "color_accent" INTEGER NOT NULL,
    CONSTRAINT "FK_Contacts_Accounts_account_id" FOREIGN KEY ("account_id") REFERENCES "Accounts" ("account_id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "Conversations" (
    "id" INTEGER NOT NULL CONSTRAINT "PK_Conversations" PRIMARY KEY AUTOINCREMENT,
    "device_id" INTEGER NOT NULL,
    "phone_sumbers" TEXT NULL,
    "image_uri" TEXT NULL,
    "id_matcher" TEXT NULL,
    "folder_id" INTEGER NOT NULL,
    "seen" INTEGER NOT NULL,
    "account_id" TEXT NULL,
    "color" INTEGER NOT NULL,
    "color_dark" INTEGER NOT NULL,
    "color_light" INTEGER NOT NULL,
    "color_accent" INTEGER NOT NULL,
    "led_color" INTEGER NOT NULL,
    "pinned" INTEGER NOT NULL,
    "read" INTEGER NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "title" TEXT NULL,
    "snippet" TEXT NULL,
    "ringtone" TEXT NULL,
    "mute" INTEGER NOT NULL,
    "archive" INTEGER NOT NULL,
    "private_notifications" INTEGER NOT NULL,
    CONSTRAINT "FK_Conversations_Accounts_account_id" FOREIGN KEY ("account_id") REFERENCES "Accounts" ("account_id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "Devices" (
    "id" INTEGER NOT NULL CONSTRAINT "PK_Devices" PRIMARY KEY AUTOINCREMENT,
    "info" TEXT NULL,
    "name" TEXT NULL,
    "primary" INTEGER NOT NULL,
    "fcm_token" TEXT NULL,
    "account_id" TEXT NULL,
    "ios" INTEGER NOT NULL
    CONSTRAINT "FK_Devices_Accounts_account_id" FOREIGN KEY ("account_id") REFERENCES "Accounts" ("account_id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "Folders" (
    "id" INTEGER NOT NULL CONSTRAINT "PK_Folders" PRIMARY KEY AUTOINCREMENT,
    "device_id" INTEGER NOT NULL,
    "name" TEXT NULL,
    "account_id" TEXT NULL,
    "color" INTEGER NOT NULL,
    "color_dark" INTEGER NOT NULL,
    "color_light" INTEGER NOT NULL,
    "color_accent" INTEGER NOT NULL,
    CONSTRAINT "FK_Folders_Accounts_account_id" FOREIGN KEY ("account_id") REFERENCES "Accounts" ("account_id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "ScheduledMessages" (
    "id" INTEGER NOT NULL CONSTRAINT "PK_ScheduledMessages" PRIMARY KEY AUTOINCREMENT,
    "device_id" INTEGER NOT NULL,
    "to" TEXT NULL,
    "data" TEXT NULL,
    "mime_type" TEXT NULL,
    "timestamp" INTEGER NOT NULL,
    "title" TEXT NULL,
    "repeat" INTEGER NOT NULL,
    "account_id" TEXT NULL,
    CONSTRAINT "FK_ScheduledMessages_Accounts_account_id" FOREIGN KEY ("account_id") REFERENCES "Accounts" ("account_id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "Templates" (
    "id" INTEGER NOT NULL CONSTRAINT "PK_Templates" PRIMARY KEY AUTOINCREMENT,
    "device_id" INTEGER NOT NULL,
    "text" TEXT NULL,
    "account_id" TEXT NULL,
    CONSTRAINT "FK_Templates_Accounts_account_id" FOREIGN KEY ("account_id") REFERENCES "Accounts" ("account_id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "Drafts" (
    "id" INTEGER NOT NULL CONSTRAINT "PK_Drafts" PRIMARY KEY AUTOINCREMENT,
    "device_id" INTEGER NOT NULL,
    "device_conversation_id" INTEGER NOT NULL,
    "data" TEXT NULL,
    "mime_type" TEXT NULL,
    "account_id" TEXT NULL,
    CONSTRAINT "FK_Drafts_Accounts_account_id" FOREIGN KEY ("account_id") REFERENCES "Accounts" ("account_id") ON DELETE CASCADE,
    CONSTRAINT "FK_Drafts_Conversations_device_conversation_id" FOREIGN KEY ("device_conversation_id") REFERENCES "Conversations" ("device_id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "Messages" (
    "id" INTEGER NOT NULL CONSTRAINT "PK_Messages" PRIMARY KEY AUTOINCREMENT,
    "device_id" INTEGER NOT NULL,
    "device_conversation_id" INTEGER NOT NULL,
    "data" TEXT NULL,
    "mime_type" TEXT NULL,
    "message_type" INTEGER NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "read" INTEGER NOT NULL,
    "seen" INTEGER NOT NULL,
    "message_from" TEXT NULL,
    "color" INTEGER NOT NULL,
    "sent_device" INTEGER NOT NULL,
    "sim_stamp" TEXT NULL,
    "account_id" TEXT NULL,
    CONSTRAINT "FK_Messages_Accounts_account_id" FOREIGN KEY ("account_id") REFERENCES "Accounts" ("account_id") ON DELETE CASCADE,
    CONSTRAINT "FK_Messages_Conversations_device_conversation_id" FOREIGN KEY ("device_conversation_id") REFERENCES "Conversations" ("device_id") ON DELETE CASCADE
);
CREATE INDEX "IX_AutoReplies_account_id" ON "AutoReplies" ("account_id");
CREATE INDEX "IX_Blacklists_account_id" ON "Blacklists" ("account_id");
CREATE INDEX "IX_Contacts_account_id" ON "Contacts" ("account_id");
CREATE INDEX "IX_Conversations_account_id" ON "Conversations" ("account_id");
CREATE INDEX "IX_Devices_account_id" ON "Devices" ("account_id");
CREATE INDEX "IX_Drafts_account_id" ON "Drafts" ("account_id");
CREATE INDEX "IX_Drafts_device_conversation_id" ON "Drafts" ("device_conversation_id");
CREATE INDEX "IX_Folders_account_id" ON "Folders" ("account_id");
CREATE INDEX "IX_Messages_account_id" ON "Messages" ("account_id");
CREATE INDEX "IX_Messages_device_conversation_id" ON "Messages" ("device_conversation_id");
CREATE INDEX "IX_ScheduledMessages_account_id" ON "ScheduledMessages" ("account_id");
CREATE INDEX "IX_Templates_account_id" ON "Templates" ("account_id");
COMMIT;
 
