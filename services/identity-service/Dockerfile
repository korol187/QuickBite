# Dockerfile for the NestJS Identity Service

# ---- Builder Stage ----
# This stage installs dependencies and builds the application.
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to leverage Docker layer caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Generate the Prisma client based on the schema
# This is crucial for your database interactions to work
RUN npx prisma generate

# Build the TypeScript project into JavaScript
RUN npm run build

# ---- Production Stage ----
# This stage creates the final, lean image for running the application.
FROM node:18-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy only the production dependencies from the builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./

# Copy the built application from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Copy the Prisma schema and client engine
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma


# The default port for a NestJS application is 3000
EXPOSE 3000

# The command to start the application
CMD ["node", "dist/main"]
