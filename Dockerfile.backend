FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
COPY packages/backend/package.json packages/backend/
COPY packages/utils/package.json packages/utils/
RUN bun install --frozen-lockfile

# Copy source
COPY packages/backend packages/backend
COPY packages/utils packages/utils

EXPOSE 3001
CMD ["bun", "packages/backend/src/index.ts"]
