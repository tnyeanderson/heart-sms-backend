START TRANSACTION;

CREATE DATABASE heartsms;

USE heartsms;

CREATE TABLE IF NOT EXISTS Accounts (
    `account_id` CHAR(64) NOT NULL PRIMARY KEY,
    `username` VARCHAR(64) NOT NULL UNIQUE,
    `password_hash` TEXT NOT NULL,
    `real_name` TEXT NULL,
    `salt1` TEXT NOT NULL,
    `salt2` TEXT NOT NULL,
    `phone_number` TEXT NOT NULL,
    `base_theme` VARCHAR(12) NOT NULL DEFAULT 'light',
    `passcode` TEXT NULL,
    `rounder_bubbles` BOOLEAN NOT NULL DEFAULT false,
    `use_global_theme` BOOLEAN NOT NULL DEFAULT false,
    `apply_primary_color_to_toolbar` BOOLEAN NOT NULL DEFAULT true,
    `conversation_categories` BOOLEAN NOT NULL DEFAULT true,
    `message_timestamp` BOOLEAN NOT NULL DEFAULT false,
    `color` INTEGER NOT NULL DEFAULT -15239726,
    `color_dark` INTEGER NOT NULL DEFAULT -15309376,
    `color_light` INTEGER NOT NULL DEFAULT -1,
    `color_accent` INTEGER NOT NULL DEFAULT -37312,
    `subscription_type` INTEGER NOT NULL DEFAULT 3,
    `subscription_expiration` BIGINT NOT NULL DEFAULT 1600789518254,
    `global_color_theme` VARCHAR(12) NULL DEFAULT 'default'
);
CREATE TABLE IF NOT EXISTS AutoReplies (
    `id` INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `device_id` BIGINT NOT NULL,
    `reply_type` TEXT NULL,
    `pattern` TEXT NULL,
    `response` TEXT NULL,
    `account_id` CHAR(64) NOT NULL,
    CONSTRAINT FK_AutoReplies_Accounts_account_id FOREIGN KEY (account_id) REFERENCES Accounts (account_id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS Blacklists (
    `id` INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `device_id` BIGINT NOT NULL,
    `phone_number` TEXT NULL,
    `phrase` TEXT NULL,
    `account_id` CHAR(64) NOT NULL,
    CONSTRAINT FK_Blacklists_Accounts_account_id FOREIGN KEY (account_id) REFERENCES Accounts (account_id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS Contacts (
    `id` INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `device_id` BIGINT NOT NULL,
    `phone_number` TEXT NULL,
    `id_matcher` TEXT NULL,
    `name` TEXT NULL,
    `contact_type` INTEGER NOT NULL,
    `account_id` CHAR(64) NOT NULL,
    `color` INTEGER NOT NULL,
    `color_dark` INTEGER NOT NULL,
    `color_light` INTEGER NOT NULL,
    `color_accent` INTEGER NOT NULL,
    CONSTRAINT FK_Contacts_Accounts_account_id FOREIGN KEY (account_id) REFERENCES Accounts (account_id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS Folders (
    `id` INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `device_id` BIGINT NOT NULL UNIQUE,
    `name` TEXT NULL,
    `account_id` CHAR(64) NOT NULL,
    `color` INTEGER NOT NULL,
    `color_dark` INTEGER NOT NULL,
    `color_light` INTEGER NOT NULL,
    `color_accent` INTEGER NOT NULL,
    CONSTRAINT FK_Folders_Accounts_account_id FOREIGN KEY (account_id) REFERENCES Accounts (account_id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS Conversations (
    `id` INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `device_id` BIGINT NOT NULL UNIQUE,
    `phone_numbers` TEXT NULL,
    `image_uri` TEXT NULL,
    `id_matcher` TEXT NULL,
    `folder_id` BIGINT NOT NULL DEFAULT -1,
    `account_id` CHAR(64) NOT NULL,
    `color` INTEGER NOT NULL,
    `color_dark` INTEGER NOT NULL,
    `color_light` INTEGER NOT NULL,
    `color_accent` INTEGER NOT NULL,
    `led_color` INTEGER NOT NULL,
    `pinned` BOOLEAN NOT NULL DEFAULT false,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `timestamp` INTEGER NOT NULL,
    `title` TEXT NULL,
    `snippet` TEXT NULL,
    `ringtone` TEXT NULL,
    `mute` BOOLEAN NOT NULL DEFAULT false,
    `archive` BOOLEAN NOT NULL DEFAULT false,
    `private_notifications` BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT FK_Conversations_Accounts_account_id FOREIGN KEY (account_id) REFERENCES Accounts (account_id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS Devices (
    `id` INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `info` TEXT NULL,
    `name` TEXT NULL,
    `primary` BOOLEAN NOT NULL,
    `fcm_token` TEXT NULL,
    `account_id` CHAR(64) NOT NULL,
    `ios` BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT FK_Devices_Accounts_account_id FOREIGN KEY (account_id) REFERENCES Accounts (account_id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS ScheduledMessages (
    `id` INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `device_id` BIGINT NOT NULL,
    `to` TEXT NULL,
    `data` TEXT NULL,
    `mime_type` TEXT NULL,
    `timestamp` INTEGER NOT NULL,
    `title` TEXT NULL,
    `repeat` INTEGER NOT NULL,
    `account_id` CHAR(64) NOT NULL,
    CONSTRAINT FK_ScheduledMessages_Accounts_account_id FOREIGN KEY (account_id) REFERENCES Accounts (account_id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS Templates (
    `id` INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `device_id` BIGINT NOT NULL,
    `text` TEXT NULL,
    `account_id` CHAR(64) NOT NULL,
    CONSTRAINT FK_Templates_Accounts_account_id FOREIGN KEY (account_id) REFERENCES Accounts (account_id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS Drafts (
    `id` INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `device_id` BIGINT NOT NULL,
    `device_conversation_id` BIGINT NOT NULL,
    `data` TEXT NULL,
    `mime_type` TEXT NULL,
    `account_id` CHAR(64) NOT NULL,
    CONSTRAINT FK_Drafts_Accounts_account_id FOREIGN KEY (account_id) REFERENCES Accounts (account_id) ON DELETE CASCADE,
    CONSTRAINT FK_Drafts_Conversations_device_conversation_id FOREIGN KEY (device_conversation_id) REFERENCES Conversations (device_id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS Messages (
    `id` INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `device_id` BIGINT NOT NULL,
    `device_conversation_id` BIGINT NOT NULL,
    `data` TEXT NULL,
    `mime_type` TEXT NULL,
    `message_type` INTEGER NOT NULL,
    `timestamp` INTEGER NOT NULL,
    `read` BOOLEAN NOT NULL,
    `seen` BOOLEAN NOT NULL,
    `message_from` TEXT NULL,
    `color` INTEGER NOT NULL,
    `sent_device` INTEGER NOT NULL DEFAULT -1,
    `sim_stamp` TEXT NULL,
    `account_id` CHAR(64) NOT NULL,
    CONSTRAINT FK_Messages_Accounts_account_id FOREIGN KEY (account_id) REFERENCES Accounts (account_id) ON DELETE CASCADE,
    CONSTRAINT FK_Messages_Conversations_device_conversation_id FOREIGN KEY (device_conversation_id) REFERENCES Conversations (device_id) ON DELETE CASCADE
);
CREATE INDEX IX_Messages_device_id ON Messages (device_id);
CREATE TABLE IF NOT EXISTS Media (
    `id` INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `message_id` BIGINT NOT NULL,
    `data` BLOB NULL,
    `account_id` CHAR(64) NOT NULL,
    --CONSTRAINT FK_Media_Accounts_account_id FOREIGN KEY (account_id) REFERENCES Accounts (account_id) ON DELETE CASCADE,
    --CONSTRAINT FK_Media_Messages_device_id FOREIGN KEY (message_id) REFERENCES Messages (device_id) ON DELETE CASCADE
);
CREATE INDEX IX_AutoReplies_account_id ON AutoReplies (account_id);
CREATE INDEX IX_Blacklists_account_id ON Blacklists (account_id);
CREATE INDEX IX_Contacts_account_id ON Contacts (account_id);
CREATE INDEX IX_Conversations_account_id ON Conversations (account_id);
CREATE INDEX IX_Devices_account_id ON Devices (account_id);
CREATE INDEX IX_Drafts_account_id ON Drafts (account_id);
CREATE INDEX IX_Drafts_device_conversation_id ON Drafts (device_conversation_id);
CREATE INDEX IX_Folders_account_id ON Folders (account_id);
CREATE INDEX IX_Messages_account_id ON Messages (account_id);
CREATE INDEX IX_Messages_device_conversation_id ON Messages (device_conversation_id);
CREATE INDEX IX_Media_account_id ON Media (account_id);
CREATE INDEX IX_Media_message_id ON Media (message_id);
CREATE INDEX IX_ScheduledMessages_account_id ON ScheduledMessages (account_id);
CREATE INDEX IX_Templates_account_id ON Templates (account_id);
COMMIT;
 
