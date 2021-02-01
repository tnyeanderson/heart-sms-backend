FROM mariadb

ENV MYSQL_RANDOM_ROOT_PASSWORD=yes

COPY ./sql/create_schema.sql /docker-entrypoint-initdb.d/01-create_schema.sql

COPY ./sql/create_dev.sql /docker-entrypoint-initdb.d/02-create_dev.sql

RUN cp /docker-entrypoint-initdb.d/01-create_schema.sql /docker-entrypoint-initdb.d/03-create_schema_dev.sql

# Replace database name for dev
RUN sed -i 's/USE `heartsms`/USE `heartsms-dev`/g' /docker-entrypoint-initdb.d/03-create_schema_dev.sql

EXPOSE 3306
