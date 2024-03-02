# Build stage
FROM node:20-buster-slim AS base

WORKDIR /app

COPY package.json yarn.lock ./

RUN apt update -y && \
    apt upgrade -y 

FROM base as dev

RUN yarn && \
    rm -rf /app/node_modules/.cache
ENTRYPOINT ["yarn"]

FROM base AS build
COPY . .

RUN yarn build --production && \
    rm -rf /app/node_modules/.cache

# Final stage
FROM node:20-buster-slim AS final

WORKDIR /app

COPY package.json yarn.lock ./
COPY --from=build /app .

RUN apt-get update && \
    apt-get install -y --no-install-recommends chromium traceroute && \
    chmod 755 /usr/bin/chromium && \
    rm -rf /var/lib/apt/lists/* /app/node_modules/.cache

EXPOSE ${PORT:-3000}

ENV CHROME_PATH='/usr/bin/chromium'

CMD ["yarn", "serve"]
