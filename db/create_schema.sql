START TRANSACTION;

CREATE DATABASE heartsms;

USE heartsms;

CREATE TABLE IF NOT EXISTS Accounts (
    `account_id` CHAR(64) NOT NULL PRIMARY KEY,
    `username` TEXT NOT NULL,
    `password_hash` TEXT NULL,
    `real_name` TEXT NULL,
    `salt1` TEXT NULL,
    `salt2` TEXT NULL,
    `phone_number` TEXT NULL,
    `name` TEXT NULL,
    `base_theme` TEXT NULL,
    `passcode` TEXT NULL,
    `rounder_bubbles` BOOLEAN NOT NULL,
    `use_global_theme` BOOLEAN NOT NULL,
    `apply_primary_color_to_toolbar` BOOLEAN NOT NULL,
    `conversation_categories` BOOLEAN NOT NULL,
    `message_timestamp` BOOLEAN NOT NULL,
    `color` INTEGER NOT NULL,
    `color_dark` INTEGER NOT NULL,
    `color_light` INTEGER NOT NULL,
    `color_accent` INTEGER NOT NULL,
    `global_color_theme` TEXT NULL
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
    `device_id` BIGINT NOT NULL,
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
    `folder_id` INTEGER NULL,
    `seen` BOOLEAN NOT NULL,
    `account_id` CHAR(64) NOT NULL,
    `color` INTEGER NOT NULL,
    `color_dark` INTEGER NOT NULL,
    `color_light` INTEGER NOT NULL,
    `color_accent` INTEGER NOT NULL,
    `led_color` INTEGER NOT NULL,
    `pinned` BOOLEAN NOT NULL,
    `read` BOOLEAN NOT NULL,
    `timestamp` INTEGER NOT NULL,
    `title` TEXT NULL,
    `snippet` TEXT NULL,
    `ringtone` TEXT NULL,
    `mute` BOOLEAN NOT NULL,
    `archive` BOOLEAN NOT NULL,
    `private_notifications` BOOLEAN NOT NULL,
    CONSTRAINT FK_Conversations_Accounts_account_id FOREIGN KEY (account_id) REFERENCES Accounts (account_id) ON DELETE CASCADE,
    CONSTRAINT FK_Conversations_Folders_folder_id FOREIGN KEY (folder_id) REFERENCES Folders (id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS Devices (
    `id` INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `info` TEXT NULL,
    `name` TEXT NULL,
    `primary` BOOLEAN NOT NULL,
    `fcm_token` TEXT NULL,
    `account_id` CHAR(64) NOT NULL,
    `ios` BOOLEAN NOT NULL,
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
    `sent_device` INTEGER NULL,
    `sim_stamp` TEXT NULL,
    `account_id` CHAR(64) NOT NULL,
    CONSTRAINT FK_Messages_Accounts_account_id FOREIGN KEY (account_id) REFERENCES Accounts (account_id) ON DELETE CASCADE,
    CONSTRAINT FK_Messages_Conversations_device_conversation_id FOREIGN KEY (device_conversation_id) REFERENCES Conversations (device_id) ON DELETE CASCADE,
    CONSTRAINT FK_Messages_Devices_sent_device FOREIGN KEY (sent_device) REFERENCES Devices (id) ON DELETE SET NULL
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
CREATE INDEX IX_ScheduledMessages_account_id ON ScheduledMessages (account_id);
CREATE INDEX IX_Templates_account_id ON Templates (account_id);
COMMIT;
 
