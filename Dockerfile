FROM node:current-buster

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

# Compile to dist/
RUN npm run compile

EXPOSE 8081
CMD [ "npm", "run", "start" ]
