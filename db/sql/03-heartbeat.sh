#!/bin/bash

# The heartbeat will tell us whether the database is fully initialized. Used in wait-for-postgres.sh

CREATE_HEARTBEAT='CREATE FUNCTION HEARTBEAT() RETURNS BOOLEAN AS $$ SELECT true; $$ LANGUAGE SQL STABLE;'

# Create the heartbeat function
psql -U "$POSTGRES_USER" -d "${POSTGRES_DB}" -c "$CREATE_HEARTBEAT"

# Create it on the dev database too
psql -U "$POSTGRES_USER" -d "${POSTGRES_DB}-dev" -c "$CREATE_HEARTBEAT"

