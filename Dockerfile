FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
COPY --from=build /app/.output .output
EXPOSE 8080
ENV PORT=8080
ENV NODE_ENV=production
CMD ["node", ".output/server/index.mjs"]
