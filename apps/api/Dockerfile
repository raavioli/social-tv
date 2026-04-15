# syntax=docker/dockerfile:1
# Dev-mode image: runs via tsx watch, skips TS build. TODO: restore multi-stage
# production build once TS errors are resolved (missing .js ESM extensions,
# missing @social-tv/shared exports, implicit any types).
FROM node:20-alpine
WORKDIR /app
RUN corepack enable && corepack prepare yarn@1.22.22 --activate

COPY package.json yarn.lock ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
RUN yarn install --frozen-lockfile

COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

ENV NODE_ENV=development
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["yarn", "workspace", "@social-tv/api", "dev"]
