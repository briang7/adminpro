FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .

# Provide a dummy DATABASE_URL for build (prerender is disabled, no DB calls during build)
ENV DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy
ENV JWT_SECRET=build-time-placeholder

RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app

# Copy the entire Analog/Nitro output (server + public must be siblings)
COPY --from=build /app/dist/analog .

EXPOSE 8080
ENV PORT=8080
ENV NODE_ENV=production
ENV NITRO_PORT=8080

CMD ["node", "server/index.mjs"]
