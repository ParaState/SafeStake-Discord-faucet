FROM node:16.18-buster
COPY . /app
WORKDIR /app
RUN mkdir /data
RUN npm install
RUN node deploy-commands.js
RUN npm install -g pm2
CMD pm2 start index.js    
