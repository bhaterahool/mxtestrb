# Install the application dependencies in a full UBI Node docker image
FROM registry.access.redhat.com/ubi8/nodejs-18:latest AS base

# Elevate privileges to run npm
USER root


WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package*.json ./

# run command
RUN yarn install

RUN mkdir /app/.parcel-cache && chmod -R 777 /app/.parcel-cache && chmod -R 777 /app







# Copy the dependencies into a minimal Node.js image
FROM registry.access.redhat.com/ubi8/nodejs-18-minimal:latest AS final

# copy the app dependencies
COPY . .

# Build the pacckages in minimal image
RUN yarn build

# Elevate privileges to change owner of source files
USER root
RUN chown -R 1001:0 /opt/app-root/src

# Restore default user privileges
USER 1001

# Run application in 'development' mode
ENV NODE_ENV development

# Listen on port 3000
ENV PORT 3000

# Container exposes port 3000
EXPOSE 3000

# Start node process
CMD ["yarn", "start"]
