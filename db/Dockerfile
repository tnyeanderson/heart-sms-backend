FROM postgres

# Copy initialization scripts
COPY ./sql/01-create_schema.sql /docker-entrypoint-initdb.d/
COPY ./sql/02-create_dev.sql /docker-entrypoint-initdb.d/
COPY ./sql/03-create_schema_dev.sh /docker-entrypoint-initdb.d/

# Make bash script executable
RUN chmod +x /docker-entrypoint-initdb.d/03-create_schema_dev.sh

VOLUME /var/lib/postgresql/data
EXPOSE 5432
