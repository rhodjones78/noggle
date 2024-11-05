# Use Node.js LTS version
FROM node:22-slim AS builder

# Install necessary build tools
RUN apt-get update && apt-get install -y openssl

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# Runtime stage
FROM node:22-slim AS runtime

# Install necessary runtime tools
RUN apt-get update && apt-get install -y openssl

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build

EXPOSE 3000

ENV NODE_ENV=development
ENV PORT=3000
ENV HOST=0.0.0.0
ENV ORIGIN=http://localhost:3000

CMD ["node", "build"]