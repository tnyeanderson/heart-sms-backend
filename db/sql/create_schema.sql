START TRANSACTION;

--SET search_path = heartsms;

-- ---------------------------
-- ---------------------------
-- Create tables -------------
-- ---------------------------
-- ---------------------------


CREATE TABLE IF NOT EXISTS Accounts (
    "account_id" SERIAL PRIMARY KEY,
    "username" VARCHAR(64) NOT NULL UNIQUE,
    "password_hash" TEXT NOT NULL,
    "real_name" TEXT NULL,
    "salt1" TEXT NOT NULL,
    "salt2" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL
) ;

CREATE TABLE IF NOT EXISTS Settings (
    "account_id" INTEGER NOT NULL PRIMARY KEY,
    "base_theme" VARCHAR(12) NOT NULL DEFAULT 'light',
    "passcode" TEXT NULL,
    "rounder_bubbles" BOOLEAN NOT NULL DEFAULT false,
    "use_global_theme" BOOLEAN NOT NULL DEFAULT false,
    "apply_primary_color_to_toolbar" BOOLEAN NOT NULL DEFAULT true,
    "conversation_categories" BOOLEAN NOT NULL DEFAULT true,
    "color" INTEGER NOT NULL DEFAULT -1352590,
    "color_dark" INTEGER NOT NULL DEFAULT -4311478,
    "color_light" INTEGER NOT NULL DEFAULT -1,
    "color_accent" INTEGER NOT NULL DEFAULT -10011977,
    "global_color_theme" VARCHAR(12) NULL DEFAULT 'default',
    "message_timestamp" BOOLEAN NOT NULL DEFAULT false,
    "subscription_type" INTEGER NOT NULL DEFAULT 3,
    "subscription_expiration" BIGINT NOT NULL DEFAULT 1600789518254,

    -- These columns have no API endpoint for selection
    "snooze" BIGINT,
    "vibrate_pattern_identifier" VARCHAR(64),
    "repeat_notifications_interval" VARCHAR(64),
    "wake_screen" VARCHAR(64),
    "heads_up" VARCHAR(64),
    "delivery_reports" BOOLEAN,
    "giffgaff_delivery" BOOLEAN,
    "strip_unicode" BOOLEAN,
    "history_in_notifications" BOOLEAN,
    "hide_message_content" BOOLEAN,
    "dismiss_notifications_on_reply_android_p" BOOLEAN,
    "bubble_style" VARCHAR(64),
    "notification_actions" VARCHAR(64),
    "left_to_right_swipe" VARCHAR(64),
    "right_to_left_swipe" VARCHAR(64),
    "sms_to_mms_message_conversion_count" VARCHAR(64),
    "mms_size_limit" VARCHAR(64),
    "group_sms" BOOLEAN,
    "mms_read_receipts" BOOLEAN,
    "auto_save_media" BOOLEAN,
    "mms_override" BOOLEAN,
    "mmsc_url" VARCHAR(64),
    "mms_proxy" VARCHAR(64),
    "mms_port" VARCHAR(64),
    "user_agent" VARCHAR(64),
    "user_agent_profile_url" VARCHAR(64),
    "user_agent_profile_tag_name" VARCHAR(64),
    "private_conversations_passcode" VARCHAR(64),
    "smart_reply" BOOLEAN,
    "smart_reply_timeout" BOOLEAN,
    "internal_browser" BOOLEAN,
    "quick_compose" BOOLEAN,
    "signature" VARCHAR(64),
    "delayed_sending" VARCHAR(64),
    "cleanup_old_messages" VARCHAR(64),
    "unknown_number_reception" VARCHAR(64),
    "sound_effects" BOOLEAN,
    "mobile_only" BOOLEAN,
    "font_size" VARCHAR(64),
    "emoji_style" VARCHAR(64),
    "keyboard_layout" VARCHAR(64),
    "global_primary_color" INTEGER,
    "global_primary_dark_color" INTEGER,
    "global_accent_color" INTEGER,
    "apply_theme_globally" BOOLEAN,
    "quick_compose_favorites" VARCHAR(64),
    "notification_actions_selection" VARCHAR(64),
    "driving_mode" BOOLEAN,
    "driving_mode_edit" VARCHAR(64),
    "vacation_mode" BOOLEAN,
    "vacation_mode_edit" VARCHAR(64),
    "blacklist_phrase_regex" BOOLEAN,
    CONSTRAINT FK_Settings_Accounts_account_id FOREIGN KEY (account_id) REFERENCES Accounts (account_id) ON DELETE CASCADE
) ;

CREATE TABLE IF NOT EXISTS SessionMap (
    "session_id" CHAR(64) NOT NULL PRIMARY KEY,
    "account_id" INTEGER NOT NULL,
    CONSTRAINT FK_SessionMap_Accounts_account_id FOREIGN KEY (account_id) REFERENCES Accounts (account_id) ON DELETE CASCADE
) ;

CREATE TABLE IF NOT EXISTS AutoReplies (
    "id" SERIAL PRIMARY KEY,
    "device_id" BIGINT NOT NULL,
    "reply_type" TEXT NULL,
    "pattern" TEXT NULL,
    "response" TEXT NULL,
    "account_id" INTEGER NOT NULL,
    CONSTRAINT FK_AutoReplies_Accounts_account_id FOREIGN KEY (account_id) REFERENCES Accounts (account_id) ON DELETE CASCADE
) ;

CREATE TABLE IF NOT EXISTS Blacklists (
    "id" SERIAL PRIMARY KEY,
    "device_id" BIGINT NOT NULL,
    "phone_number" TEXT NULL,
    "phrase" TEXT NULL,
    "account_id" INTEGER NOT NULL,
    CONSTRAINT FK_Blacklists_Accounts_account_id FOREIGN KEY (account_id) REFERENCES Accounts (account_id) ON DELETE CASCADE
) ;

CREATE TABLE IF NOT EXISTS Contacts (
    "id" SERIAL PRIMARY KEY,
    "device_id" BIGINT NOT NULL,
    "phone_number" TEXT NULL,
    "id_matcher" TEXT NULL,
    "name" TEXT NULL,
    "contact_type" INTEGER NOT NULL,
    "account_id" INTEGER NOT NULL,
    "color" INTEGER NOT NULL,
    "color_dark" INTEGER NOT NULL,
    "color_light" INTEGER NOT NULL,
    "color_accent" INTEGER NOT NULL,
    CONSTRAINT FK_Contacts_Accounts_account_id FOREIGN KEY (account_id) REFERENCES Accounts (account_id) ON DELETE CASCADE
) ;

CREATE TABLE IF NOT EXISTS Folders (
    "id" SERIAL PRIMARY KEY,
    "device_id" BIGINT NOT NULL UNIQUE,
    "name" TEXT NULL,
    "account_id" INTEGER NOT NULL,
    "color" INTEGER NOT NULL,
    "color_dark" INTEGER NOT NULL,
    "color_light" INTEGER NOT NULL,
    "color_accent" INTEGER NOT NULL,
    CONSTRAINT FK_Folders_Accounts_account_id FOREIGN KEY (account_id) REFERENCES Accounts (account_id) ON DELETE CASCADE
) ;

CREATE TABLE IF NOT EXISTS Conversations (
    "id" SERIAL PRIMARY KEY,
    "device_id" BIGINT NOT NULL UNIQUE,
    "phone_numbers" TEXT NULL,
    "image_uri" TEXT NULL,
    "id_matcher" TEXT NULL,
    "folder_id" BIGINT NOT NULL DEFAULT -1,
    "account_id" INTEGER NOT NULL,
    "color" INTEGER NOT NULL,
    "color_dark" INTEGER NOT NULL,
    "color_light" INTEGER NOT NULL,
    "color_accent" INTEGER NOT NULL,
    "led_color" INTEGER NOT NULL,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "timestamp" BIGINT NOT NULL,
    "title" TEXT NULL,
    "snippet" TEXT NULL,
    "ringtone" TEXT NULL,
    "mute" BOOLEAN NOT NULL DEFAULT false,
    "archive" BOOLEAN NOT NULL DEFAULT false,
    "private_notifications" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT FK_Conversations_Accounts_account_id FOREIGN KEY (account_id) REFERENCES Accounts (account_id) ON DELETE CASCADE
) ;

CREATE TABLE IF NOT EXISTS Devices (
    "id" SERIAL PRIMARY KEY,
    "info" TEXT NULL,
    "name" TEXT NULL,
    "primary" BOOLEAN NOT NULL,
    "fcm_token" TEXT NULL,
    "account_id" INTEGER NOT NULL,
    "ios" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT FK_Devices_Accounts_account_id FOREIGN KEY (account_id) REFERENCES Accounts (account_id) ON DELETE CASCADE
) ;

CREATE TABLE IF NOT EXISTS ScheduledMessages (
    "id" SERIAL PRIMARY KEY,
    "device_id" BIGINT NOT NULL,
    "to" TEXT NULL,
    "data" TEXT NULL,
    "mime_type" TEXT NULL,
    "timestamp" BIGINT NOT NULL,
    "title" TEXT NULL,
    "repeat" INTEGER NOT NULL,
    "account_id" INTEGER NOT NULL,
    CONSTRAINT FK_ScheduledMessages_Accounts_account_id FOREIGN KEY (account_id) REFERENCES Accounts (account_id) ON DELETE CASCADE
) ;

CREATE TABLE IF NOT EXISTS Templates (
    "id" SERIAL PRIMARY KEY,
    "device_id" BIGINT NOT NULL,
    "text" TEXT NULL,
    "account_id" INTEGER NOT NULL,
    CONSTRAINT FK_Templates_Accounts_account_id FOREIGN KEY (account_id) REFERENCES Accounts (account_id) ON DELETE CASCADE
) ;

CREATE TABLE IF NOT EXISTS Drafts (
    "id" SERIAL PRIMARY KEY,
    "device_id" BIGINT NOT NULL,
    "device_conversation_id" BIGINT NOT NULL,
    "data" TEXT NULL,
    "mime_type" TEXT NULL,
    "account_id" INTEGER NOT NULL,
    CONSTRAINT FK_Drafts_Accounts_account_id FOREIGN KEY (account_id) REFERENCES Accounts (account_id) ON DELETE CASCADE,
    CONSTRAINT FK_Drafts_Conversations_device_conversation_id FOREIGN KEY (device_conversation_id) REFERENCES Conversations (device_id) ON DELETE CASCADE
) ;

CREATE TABLE IF NOT EXISTS Messages (
    "id" SERIAL PRIMARY KEY,
    "device_id" BIGINT NOT NULL,
    "device_conversation_id" BIGINT NOT NULL,
    "data" TEXT NULL,
    "mime_type" TEXT NULL,
    "message_type" INTEGER NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "read" BOOLEAN NOT NULL,
    "seen" BOOLEAN NOT NULL,
    "message_from" TEXT NULL,
    "color" INTEGER NULL,
    "sent_device" INTEGER NOT NULL DEFAULT -1,
    "sim_stamp" TEXT NULL,
    "account_id" INTEGER NOT NULL,
    CONSTRAINT FK_Messages_Accounts_account_id FOREIGN KEY (account_id) REFERENCES Accounts (account_id) ON DELETE CASCADE
) ;
CREATE INDEX IX_Messages_device_id ON Messages (device_id) ;

CREATE TABLE IF NOT EXISTS Media (
    "id" SERIAL PRIMARY KEY,
    "message_id" BIGINT NOT NULL,
    "data" BYTEA NULL,
    "account_id" INTEGER NOT NULL,
    CONSTRAINT FK_Media_Accounts_account_id FOREIGN KEY (account_id) REFERENCES Accounts (account_id) ON DELETE CASCADE
) ;


-- ---------------------------
-- ---------------------------
-- Create Indexes ------------
-- ---------------------------
-- ---------------------------


CREATE INDEX IX_SessionMap_session_id ON SessionMap (session_id) ;
CREATE INDEX IX_AutoReplies_account_id ON AutoReplies (account_id) ;
CREATE INDEX IX_Blacklists_account_id ON Blacklists (account_id) ;
CREATE INDEX IX_Contacts_account_id ON Contacts (account_id) ;
CREATE INDEX IX_Conversations_account_id ON Conversations (account_id) ;
CREATE INDEX IX_Devices_account_id ON Devices (account_id) ;
CREATE INDEX IX_Drafts_account_id ON Drafts (account_id) ;
CREATE INDEX IX_Drafts_device_conversation_id ON Drafts (device_conversation_id) ;
CREATE INDEX IX_Folders_account_id ON Folders (account_id) ;
CREATE INDEX IX_Messages_account_id ON Messages (account_id) ;
CREATE INDEX IX_Messages_device_conversation_id ON Messages (device_conversation_id) ;
CREATE INDEX IX_Media_account_id ON Media (account_id) ;
CREATE INDEX IX_Media_message_id ON Media (message_id) ;
CREATE INDEX IX_ScheduledMessages_account_id ON ScheduledMessages (account_id) ;
CREATE INDEX IX_Templates_account_id ON Templates (account_id) ;


-- ---------------------------
-- ---------------------------
-- Functions -----------------
-- ---------------------------
-- ---------------------------

CREATE FUNCTION TRANSLATE_SESSION_ID(sessionId CHAR(64)) RETURNS INTEGER AS $$
    SELECT account_id FROM SessionMap WHERE session_id = sessionId LIMIT 1;
$$ LANGUAGE SQL STABLE;



-- ---------------------------
-- ---------------------------
-- Triggers ------------------
-- ---------------------------
-- ---------------------------

-- Messages are sometimes added before a conversation is, so we can't use a FK
CREATE TRIGGER before_conversation_delete
BEFORE DELETE
ON Conversations FOR EACH ROW
BEGIN
    DELETE FROM Messages WHERE Messages.device_conversation_id = OLD.device_id
    AND Messages.account_id = OLD.account_id;
END //


-- Media is sometimes added before a message is, so we can't use a FK
CREATE TRIGGER before_message_delete
BEFORE DELETE
ON Messages FOR EACH ROW
BEGIN
    DELETE FROM Media WHERE Media.message_id = OLD.device_id
    AND Media.account_id = OLD.account_id;
END //


-- Remove conversations from folder before deleting
CREATE TRIGGER before_folder_delete
BEFORE DELETE
ON Folders FOR EACH ROW
BEGIN
    UPDATE Conversations SET folder_id = -1 WHERE Conversations.folder_id = OLD.device_id 
    AND Conversations.account_id = OLD.account_id;
END //


-- Disassociate device from messages before deleting
CREATE TRIGGER before_device_delete
BEFORE DELETE
ON Devices FOR EACH ROW
BEGIN
    UPDATE Messages SET sent_device = -1 WHERE Messages.sent_device = OLD.id 
    AND Messages.account_id = OLD.account_id;
END //



-- ---------------------------
-- ---------------------------
-- Stored Procedures ---------
-- ---------------------------
-- ---------------------------

-- Stored procedure for cleaning an account
CREATE PROCEDURE CleanAccount(IN sessionId CHAR(64))
BEGIN
    DECLARE accountId INTEGER;
    SET accountId = TRANSLATE_SESSION_ID(sessionId);

    DELETE FROM Messages WHERE account_id = accountId;
    DELETE FROM Conversations WHERE account_id = accountId;
    DELETE FROM Contacts WHERE account_id = accountId;
    DELETE FROM Drafts WHERE account_id = accountId;
    DELETE FROM ScheduledMessages WHERE account_id = accountId;
    DELETE FROM Blacklists WHERE account_id = accountId;
    DELETE FROM Folders WHERE account_id = accountId;
    DELETE FROM AutoReplies WHERE account_id = accountId;
    DELETE FROM Templates WHERE account_id = accountId;
END //


-- Stored procedure for updating the primary device
-- Sets all other devices to false before setting the new one to "true"
-- TODO: Add a check to make sure the new id exists first!
CREATE PROCEDURE UpdatePrimaryDevice(IN sessionId CHAR(64), IN newDeviceId INT)
BEGIN
    DECLARE accountId INTEGER;
    SET accountId = TRANSLATE_SESSION_ID(sessionId);

    UPDATE Devices SET "primary" = false WHERE account_id = accountId;
    UPDATE Devices SET "primary" = true WHERE id = newDeviceId AND account_id = accountId;
END //


-- Stored procedure for creating an account
-- Creates the account then stores a session ID
CREATE PROCEDURE CreateAccount(
    IN sessionId CHAR(64), 
    IN username VARCHAR(64), 
    IN passwordHash TEXT, 
    IN salt1 TEXT, 
    IN salt2 TEXT, 
    IN realName TEXT, 
    IN phoneNumber TEXT)
BEGIN
    DECLARE EXIT HANDLER FOR 1062
    BEGIN
        ROLLBACK;
        SELECT "user already exists" error;
    END;

    START TRANSACTION;
    INSERT INTO Accounts  ("username", "password_hash", "salt1", "salt2", "real_name", "phone_number") VALUES (username, passwordHash, salt1, salt2, realName, phoneNumber);
    INSERT INTO SessionMap ("session_id", "account_id") VALUES (sessionId, LAST_INSERT_ID());
    INSERT INTO Settings ("account_id") VALUES (LAST_INSERT_ID());
    COMMIT;
END //

DELIMITER ;

COMMIT;
