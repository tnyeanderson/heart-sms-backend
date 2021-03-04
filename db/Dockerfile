FROM postgres

# Copy initialization scripts
COPY ./sql/* /docker-entrypoint-initdb.d/

# Make bash script executable
RUN chmod +x /docker-entrypoint-initdb.d/03-create_schema_dev.sh

VOLUME /var/lib/postgresql/data
EXPOSE 5432
