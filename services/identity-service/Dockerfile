# Dockerfile for the NestJS Identity Service

# ---- Base Stage ----
# This stage contains common configuration for all stages
FROM node:24.5.0-alpine3.22 AS base

# Install dependencies needed for Prisma (especially for native binaries)
RUN apk add --no-cache openssl

# Create app directory
WORKDIR /usr/src/app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# ---- Dependencies Stage ----
# This stage installs all dependencies (including dev dependencies)
FROM base AS deps

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies
RUN npm ci --only=production --frozen-lockfile && \
    cp -R node_modules prod_node_modules && \
    npm ci --frozen-lockfile

# ---- Development Stage ----
# This stage is optimized for development with hot reload
FROM base AS development

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including dev dependencies)
RUN npm ci --frozen-lockfile

# Generate Prisma client
RUN npx prisma generate

# Copy TypeScript configuration
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Create directories and set permissions
RUN mkdir -p src dist && chown -R nestjs:nodejs /usr/src/app
USER nestjs

# Expose port
EXPOSE 3000

# Start in development mode with watch
CMD ["npm", "run", "start:dev"]

# ---- Builder Stage ----
# This stage builds the application
FROM base AS builder

# Copy dependencies from deps stage
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=deps /usr/src/app/prisma ./prisma

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build && npm prune --omit=dev

# ---- Production Stage ----
# This stage creates the final, lean image for running the application
FROM base AS runner

# Copy production dependencies
COPY --from=deps /usr/src/app/prod_node_modules ./node_modules

# Copy built application
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma

# Copy package.json for metadata
COPY --from=builder /usr/src/app/package*.json ./

# Change ownership to non-root user
RUN chown -R nestjs:nodejs /usr/src/app
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node --version || exit 1

# Start the application
CMD ["node", "dist/main"]
