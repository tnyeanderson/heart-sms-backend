#!/bin/bash
# wait-for-postgres.sh

# @see https://docs.docker.com/compose/startup-order/
# @see https://github.com/cobrainer/pg-docker-with-restored-db#further-notes-about-the-wait-for-pg-isreadysh

set -e
  
cmd="$@"

export PGPASSFILE='/tmp/.pgpass'

echo "$DB_HOST:5432:$POSTGRES_DB:$POSTGRES_USER:$POSTGRES_PASSWORD" > "$PGPASSFILE"

chmod 400 "$PGPASSFILE"

# Check the heartbeat function
until psql -h "$DB_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT HEARTBEAT()" &> /dev/null; do
  sleep 1
done

# Postgres is up - you can execute commands now

rm "$PGPASSFILE"

unset PGPASSFILE

exec $cmd
