#!/bin/bash

psql -U heart -d 'heartsms-dev' -f /docker-entrypoint-initdb.d/01-create_schema.sql