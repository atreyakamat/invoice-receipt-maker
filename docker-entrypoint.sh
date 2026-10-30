#!/bin/sh
set -e

# Create or update tables to match prisma/schema.prisma. Refuses changes that would drop data.
echo "Syncing database schema..."
until npx prisma db push --skip-generate; do
  echo "Database not ready, retrying in 3s..."
  sleep 3
done

exec "$@"
