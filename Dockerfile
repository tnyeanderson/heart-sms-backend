FROM node:current-buster

# Used for wait-for-postgres.sh
RUN apt-get update && apt-get install -y postgresql-client

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm ci

# Bundle app source
COPY api/ api/

# Add tsconfig
COPY tsconfig.json .

# Add script that waits for postgres before starting the backend
COPY wait-for-postgres.sh .
RUN chmod +x wait-for-postgres.sh

# Compile to dist/
RUN npm run compile

EXPOSE 8081

ENTRYPOINT [ "./wait-for-postgres.sh" ]
CMD [ "npm", "run", "start" ]
