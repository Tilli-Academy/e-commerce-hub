# ============================================
# Stage 1: Build the React client
# ============================================
FROM node:20-alpine AS client-build

WORKDIR /app/client

COPY client/package.json client/package-lock.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

# ============================================
# Stage 2: Production server
# ============================================
FROM node:20-alpine AS production

RUN apk add --no-cache dumb-init

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app/server

COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev && npm install drizzle-kit

COPY server/src/ ./src/
COPY server/server.js ./
COPY server/drizzle.config.js ./
COPY server/drizzle/ ./drizzle/

# Express resolves: path.resolve(__dirname, '../../client/dist')
# __dirname = /app/server/src => ../../client/dist = /app/client/dist
COPY --from=client-build /app/client/dist /app/client/dist

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 5000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
