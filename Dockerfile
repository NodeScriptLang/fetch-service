FROM node:18.9-slim as builder

WORKDIR /builder
COPY . ./

RUN npm ci && npm run build && rm -rf node_modules

##################################################

FROM node:18.9-slim

ENV NODE_ENV production

RUN apt-get update && apt-get install -y wget
RUN wget "https://github.com/moparisthebest/static-curl/releases/download/v7.84.0/curl-amd64"
RUN mv ./curl-amd64 /usr/local/bin/curl && chmod +x /usr/local/bin/curl
ENV CURL_PATH /usr/local/bin/curl

RUN mkdir /app && chown -R node:node /app
WORKDIR /app
USER node

COPY --from=builder /builder .
RUN npm ci --production

WORKDIR /app
CMD ["node", "out/bin/http.js"]
