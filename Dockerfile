ARG NODE_VERSION=22
ARG DEBIAN_VERSION=bullseye

FROM node:${NODE_VERSION}-${DEBIAN_VERSION} AS build

SHELL ["/bin/bash", "-euo", "pipefail", "-c"]

# Install chromium plus build tooling so puppeteer and friends compile cleanly
RUN apt-get update -qq --fix-missing && \
    apt-get -qqy install --allow-unauthenticated gnupg wget && \
    wget --quiet --output-document=- \
      https://dl-ssl.google.com/linux/linux_signing_key.pub | \
      gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" \
      > /etc/apt/sources.list.d/google.list && \
    apt-get update -qq && \
    apt-get -qqy --no-install-recommends install \
      chromium traceroute python make g++ && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy workspace manifests first so yarn can plan and cache the dependency graph
COPY package.json yarn.lock ./
COPY packages/api/package.json ./packages/api/package.json
COPY packages/app/package.json ./packages/app/package.json
COPY packages/site/package.json ./packages/site/package.json

RUN yarn install --frozen-lockfile --network-timeout 100000 && \
    rm -rf /app/node_modules/.cache

# Copy api and app sources plus the site's shared public assets
# (fonts, icons) which the standalone app build pulls in. Site src is skipped.
COPY packages/api ./packages/api
COPY packages/app ./packages/app
COPY packages/site/public ./packages/site/public

RUN yarn build:docker

FROM node:${NODE_VERSION}-${DEBIAN_VERSION} AS final

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends chromium traceroute && \
    chmod 755 /usr/bin/chromium && \
    rm -rf /var/lib/apt/lists/* /tmp/*

COPY --from=build /app/package.json /app/yarn.lock ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/api ./packages/api
COPY --from=build /app/packages/app/package.json ./packages/app/package.json
COPY --from=build /app/packages/app/dist ./packages/app/dist

EXPOSE ${PORT:-3000}

ENV CHROME_PATH='/usr/bin/chromium' \
    PUPPETEER_EXECUTABLE_PATH='/usr/bin/chromium' \
    PUPPETEER_SKIP_DOWNLOAD='true'

CMD ["node", "packages/api/server.js"]
