FROM node:20-alpine

RUN apk add --no-cache tini

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY src ./src

RUN addgroup -S bot && adduser -S bot -G bot \
    && chown -R bot:bot /app
USER bot

ENV NODE_ENV=production

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "src/index.js"]
