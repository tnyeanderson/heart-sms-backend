FROM postgres

# Copy initialization scripts
COPY ./sql/* /docker-entrypoint-initdb.d/

# Make bash scripts executable
RUN chmod +x /docker-entrypoint-initdb.d/*.sh

VOLUME /var/lib/postgresql/data
EXPOSE 5432
