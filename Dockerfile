# syntax=docker/dockerfile:1.4

# Multi-stage build for DevOps Notes application
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    curl \
    && rm -rf /var/cache/apk/*

# Copy package files for dependency installation
COPY package*.json ./

# --- Builder Stage ---
FROM base AS builder

# Install all dependencies (including devDependencies)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

# --- Web Production Stage ---
FROM nginx:1.25-alpine AS web

# Install curl for health checks and create nginx directories
RUN apk add --no-cache curl \
    && mkdir -p /var/cache/nginx \
        /var/cache/nginx/client_temp \
        /var/cache/nginx/proxy_temp \
        /var/cache/nginx/fastcgi_temp \
        /var/cache/nginx/uwsgi_temp \
        /var/cache/nginx/scgi_temp \
        /var/run \
        /run \
    && chown -R nginx:nginx /var/cache/nginx /var/run /run \
    && rm -rf /var/cache/apk/*

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Set proper permissions for nginx user
RUN chown -R nginx:nginx /usr/share/nginx/html \
    && chmod -R 755 /usr/share/nginx/html

# Switch to nginx user for security
USER nginx

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# --- Development Stage ---
FROM base AS development

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy source code
COPY . .

# Expose development port
EXPOSE 5173

# Start development server with host binding
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# --- Backend Stage ---
FROM node:20-alpine AS backend

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache curl && rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Copy backend source and configuration
COPY server.js ./
COPY .env* ./
COPY scripts/ ./scripts/
# The backend will use OLLAMA_API_URL from environment (set in compose)

# Create non-root user
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Set proper permissions
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose backend port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Start backend server
CMD ["node", "server.js"]

# --- Electron Stage (for desktop builds) ---
FROM node:20-alpine AS electron

# Set working directory
WORKDIR /app

# Install dependencies for Electron
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    && rm -rf /var/cache/apk/*

# Create a non-root user
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy only necessary files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/main.js ./main.js
COPY --from=builder /app/public ./public
COPY --from=builder /app/index.html ./index.html

# Set environment variables
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV CHROME_PATH=/usr/lib/chromium/

# Set proper permissions
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Electron apps require a display. In headless/server environments, you may need xvfb or similar.
# This image assumes you will run it on a Linux desktop with a display available.
CMD ["npx", "electron", "."]
