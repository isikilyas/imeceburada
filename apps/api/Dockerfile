# Built with the monorepo root as the Docker build context (Railway's
# "Root Directory" for this service only changes where it looks for this
# Dockerfile and the default working directory — the full repo is still
# available to COPY from). This exists because Nixpacks' auto-detected
# build for this service wasn't reliably carrying `apps/api/dist` through
# to the runtime image.

FROM node:20-alpine AS build
WORKDIR /repo
RUN apk add --no-cache openssl
RUN corepack enable

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared/package.json packages/shared/package.json
COPY apps/api/package.json apps/api/package.json
COPY apps/api/prisma apps/api/prisma
RUN pnpm install --frozen-lockfile

COPY packages/shared packages/shared
COPY apps/api apps/api
RUN pnpm --filter @imeceburada/shared build
RUN pnpm --filter @imeceburada/api build

FROM node:20-alpine AS runtime
WORKDIR /repo
RUN apk add --no-cache openssl
RUN corepack enable
ENV NODE_ENV=production

# Copy the fully-installed node_modules (incl. devDependencies, since the
# `prisma` CLI is one and is needed at startup for `migrate deploy`) and the
# already-built packages straight from the build stage — no second install.
COPY --from=build /repo/node_modules node_modules
COPY --from=build /repo/packages/shared packages/shared
COPY --from=build /repo/apps/api apps/api

WORKDIR /repo/apps/api
EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]
