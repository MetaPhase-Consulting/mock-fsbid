# Check out https://hub.docker.com/_/node to select a new base image
FROM node:10-slim

# Get nginx
RUN apt-get update \
    && apt-get install -y nginx

# Setup config for nginx
COPY nginx.conf /etc/nginx/sites-available/mockfsbid
RUN rm /etc/nginx/sites-available/default
RUN ln -s /etc/nginx/sites-available/mockfsbid /etc/nginx/sites-enabled/

# allow node user to run nginx
RUN touch /var/run/nginx.pid && \
  chown -R node:node /var/run/nginx.pid && \
  chown -R node:node /var/log/nginx && \
  chown -R node:node /var/lib/nginx

# Set to a non-root built-in user `node`
USER node

# Create app directory (with user `node`)
RUN mkdir -p /home/node/app

WORKDIR /home/node/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY --chown=node package*.json ./

RUN npm install

# Bundle app source code
COPY --chown=node . .

# Bind to all network interfaces so that it can be mapped to the host OS
ENV HOST=0.0.0.0

EXPOSE ${PORT} 80
CMD [ "nginx", "&&", "npm", "start" ]
