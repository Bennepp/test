FROM node:22-slim AS build

WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
# Pin the pnpm version explicitly: unpinned `corepack enable` resolves
# whatever pnpm is "latest" at build time, which can require a newer Node
# than this image ships (e.g. pnpm 11 needs Node >=22.13 for node:sqlite).
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
RUN pnpm install --frozen-lockfile || pnpm install

COPY . .
RUN pnpm run build

FROM node:22-slim AS run

WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.mjs ./next.config.mjs
COPY --from=build /app/public ./public

EXPOSE 3000
CMD ["pnpm", "run", "start"]
