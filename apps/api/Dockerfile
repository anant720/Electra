# apps/api/Dockerfile
# Multi-stage production build for ELECTRA API (Monorepo)

# ─── Stage 1: Build ───
FROM node:20-alpine AS builder
WORKDIR /app

# Copy workspace configuration
COPY package*.json ./
COPY turbo.json ./
COPY tsconfig.json ./
COPY tsconfig.base.json ./

# Copy package manifests
COPY apps/api/package*.json ./apps/api/
COPY packages/types/package*.json ./packages/types/
COPY prisma ./prisma/

# Install dependencies (from root to leverage workspace caching)
RUN npm install

# Copy full source
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the specific workspace
RUN npm run build --workspace=@electra/api



# ─── Stage 2: Production ───
FROM node:20-alpine
WORKDIR /app

# 1. Copy workspace manifests (Required for local linking)
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/types/package*.json ./packages/types/
COPY packages/types/src ./packages/types/src

# 2. Install production dependencies
 for the whole workspace
RUN npm install --omit=dev --workspace=@electra/api

# 3. Copy build artifacts and Prisma from builder
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/prisma ./prisma

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Runtime Env
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Run the app from its workspace location
CMD ["node", "apps/api/dist/main"]

