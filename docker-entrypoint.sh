#!/bin/sh
set -e

echo "==> Running Prisma Generate..."
pnpm exec prisma generate

echo "==> Pushing Prisma Schema to Database..."
pnpm exec prisma db push

echo "==> Starting Application..."
exec "$@"
