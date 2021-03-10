#!/bin/bash

DEV_DB="${POSTGRES_DB}-dev"

# Create the dev database
psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "CREATE DATABASE \"${DEV_DB}\""

# Run create_schema on the heartsms-dev database
psql -U "$POSTGRES_USER" -d "$DEV_DB" -f /docker-entrypoint-initdb.d/01-create_schema.sql