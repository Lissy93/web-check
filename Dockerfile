# Specify the Node.js version to use
ARG NODE_VERSION=25

# Specify the Debian version to use, the default is "trixie".
ARG DEBIAN_VERSION=trixie

# Use Node.js Docker image as the base image, with specific Node and Debian versions
FROM node:${NODE_VERSION}-slim AS build

# Set the container's default shell to Bash and enable some options
SHELL ["/bin/bash", "-euo", "pipefail", "-c"]

# Install Chromium browser and Download and verify Google Chrome’s signing key
RUN apt-get update -qq --fix-missing && \
    apt-get -qqy install --allow-unauthenticated gnupg wget && \
    wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list && \
    apt-get update -qq && \
    apt-get -qqy --no-install-recommends install chromium traceroute python3 make g++ && \
    rm -rf /var/lib/apt/lists/* 

# Run the Chromium browser's version command and redirect its output to the /etc/chromium-version file
RUN /usr/bin/chromium --no-sandbox --version > /etc/chromium-version

# Set the working directory to /app
WORKDIR /app

# Copy package.json and yarn.lock to the working directory
COPY package.json yarn.lock ./

# Run yarn install to install dependencies and clear yarn cache
RUN yarn install --frozen-lockfile --network-timeout 100000 && \
    yarn cache clean

# Copy all files to working directory
COPY . .

# Set build-time environment variables for Astro
ENV SITE_URL=http://localhost:3000 \
    PLATFORM=node \
    OUTPUT=hybrid

# Run yarn build to build the application
RUN yarn build

# Final stage
FROM node:${NODE_VERSION}-slim AS final

WORKDIR /app

COPY package.json yarn.lock ./
COPY --from=build /app .

RUN apt-get update && \
    apt-get install -y --no-install-recommends chromium traceroute && \
    chmod 755 /usr/bin/chromium && \
    rm -rf /var/lib/apt/lists/* /app/node_modules/.cache

# Exposed container port, the default is 3000, which can be modified through the environment variable PORT
EXPOSE ${PORT:-3000}

# Set the environment variable CHROME_PATH to specify the path to the Chromium binaries
# Set the environment variable PUPPETEER_EXECUTABLE_PATH to specify the path to the Chromium binaries (used by Wappalyzer)
ENV CHROME_PATH='/usr/bin/chromium' \
    PUPPETEER_EXECUTABLE_PATH='/usr/bin/chromium'

# Use node directly instead of yarn for faster startup
CMD ["node", "server.js"]
