FROM postgres

COPY ./sql/01-create_schema.sql /docker-entrypoint-initdb.d/01-create_schema.sql

COPY ./sql/02-create_dev.sql /docker-entrypoint-initdb.d/02-create_dev.sql

COPY ./sql/03-create_schema_dev.sh /docker-entrypoint-initdb.d/03-create_schema_dev.sh

RUN chmod +x /docker-entrypoint-initdb.d/03-create_schema_dev.sh

#RUN cp /docker-entrypoint-initdb.d/01-create_schema.sql /docker-entrypoint-initdb.d/03-create_schema_dev.sql

# Replace database name for dev
#RUN sed -i 's/SET search_path = heartsms/SET search_path = heartsms-dev/g' /docker-entrypoint-initdb.d/03-create_schema_dev.sql

EXPOSE 5432
