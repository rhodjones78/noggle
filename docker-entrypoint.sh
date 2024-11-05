#!/bin/bash
set -e

# Generate Prisma Client if it doesn't exist
if [ ! -d "node_modules/.prisma" ]; then
    echo "Generating Prisma Client..."
    npx prisma generate
fi

# Execute the provided command
exec "$@"