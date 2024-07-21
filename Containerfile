 Use the official Node.js image as the base image
#FROM node:14 as build
FROM registry.access.redhat.com/ubi8/nodejs-16:latest AS base

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the entire application to the working directory
COPY . .

# Build the Next.js application
RUN npm run build

# Use a lightweight Node.js image for the production environment
#FROM node:14-alpine
FROM registry.access.redhat.com/ubi8/nodejs-16:latest AS base

# Set the working directory in the container
WORKDIR /app

# Copy the built application from the previous stage
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json

# Install only production dependencies
RUN npm install --production

# Expose the port that the Next.js application will run on
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]
