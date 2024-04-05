# Specify the Node.js version to use
ARG NODE_VERSION=20

# Specify the Debian version to use, the default is "bullseye"
ARG OS_VERSION=alpine3.19

# Use Node.js Docker image as the base image, with specific Node and Debian versions
FROM node:${NODE_VERSION}-${OS_VERSION} AS build

# Set the container's default shell to Bash and enable some options
#SHELL ["/bin/bash", "-euo", "pipefail", "-c"]

# Install Chromium browser and Download and verify Google Chrome’s signing key
RUN apk update && \
    apk add --no-cache chromium python3 make g++ && \
    rm -rf /var/cache/apk/*

# Set the working directory to /app
WORKDIR /app

# Copy package.json and yarn.lock to the working directory
COPY package.json yarn.lock ./

# Run yarn install to install dependencies and clear yarn cache
RUN apk update && \
    apk add --no-cache yarn git && \
    yarn install --production --frozen-lockfile --network-timeout 100000 && \
    rm -rf /app/node_modules/.cache

# Copy all files to working directory
COPY . .

# Run yarn build to build the application
RUN yarn build --production

# Final stage
FROM node:${NODE_VERSION}-${OS_VERSION}  AS final

WORKDIR /app

COPY package.json yarn.lock ./
COPY --from=build /app .

RUN apk update && \
    apk add --no-cache chromium && \
    chmod 755 /usr/bin/chromium-browser && \
    rm -rf /var/cache/apk/* /app/node_modules/.cache

# Exposed container port, the default is 3000, which can be modified through the environment variable PORT
EXPOSE ${PORT:-3000}

# Define the command executed when the container starts and start the server.js of the Node.js application
CMD ["yarn", "serve"]