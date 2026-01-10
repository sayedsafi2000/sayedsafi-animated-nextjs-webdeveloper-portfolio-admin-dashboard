# Multi-stage build for Next.js Admin Dashboard
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY admin_dashboard/package.json admin_dashboard/package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY admin_dashboard/ .

# Set environment variables for build (you can add build-time env vars here if needed)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build Next.js app
# Note: NEXT_PUBLIC_ variables must be available at build time
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
# The standalone output includes server.js in the root of .next/standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

# Expose port (Coolify will set the PORT env var via environment)
EXPOSE 3001

ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# Start the Next.js server
# The server.js is created in the standalone output root
CMD ["node", "server.js"]
