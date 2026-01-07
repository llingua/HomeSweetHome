ARG BUILD_FROM=alpine:3.18

FROM node:22 AS builder
WORKDIR /app

RUN git clone --depth 1 -b main https://github.com/llingua/HomeSweetHome . && \
  npm install --verbose && \
  npm run build && \
  npm prune --omit=dev

FROM $BUILD_FROM
WORKDIR /rootfs

COPY --from=builder /app/.next ./ ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server.js ./server.js

RUN apk add --no-cache nodejs-current bash jq curl && \
  ln -s /rootfs/data /data

COPY run.sh /run.sh
RUN chmod +x /run.sh

RUN curl -J -L -o /tmp/bashio.tar.gz \
  "https://github.com/hassio-addons/bashio/archive/v0.16.2.tar.gz" && \
  mkdir /tmp/bashio && \
  tar zxvf /tmp/bashio.tar.gz --strip 1 -C /tmp/bashio && \
  mv /tmp/bashio/lib /usr/lib/bashio && \
  ln -s /usr/lib/bashio/bashio /usr/bin/bashio && \
  rm -rf /tmp/bashio.tar.gz /tmp/bashio

ENV PORT=8092 \
  NODE_ENV=production \
  ADDON=true \
  DATA_PREFIX=homesweethome

CMD [ "/usr/bin/bashio", "/run.sh" ]
