# 🐳 DevOps Notes - Docker Deployment Guide

This guide covers deploying the DevOps Notes application using Docker and Docker Compose.

## 🚀 Application Features

The DevOps Notes application includes:
- **📝 Smart Note Taking**: Create, organize, and manage DevOps notes with intelligent tagging
- **🤖 AI Code Reviewer**: Get instant feedback on code, configurations, and DevOps practices
- **❓ AI DevOps Assistant**: Ask questions and get expert DevOps guidance powered by AI
- **📰 Real DevOps News**: Stay updated with the latest DevOps trends and announcements
- **🔧 DevOps Focused**: Built specifically for DevOps engineers with relevant tools and insights
- **🌙 Dark Mode**: Toggle between light and dark themes for comfortable viewing
- **📱 Mobile Responsive**: Works seamlessly on desktop, tablet, and mobile devices

## 📋 Prerequisites

- Docker Desktop (v20.10+) or Docker Engine (v20.10+)
- Docker Compose v2
- At least 2GB RAM available for containers
- Git (to clone the repository)

## 🚀 Quick Start

### Prerequisites
- Docker Desktop (v20.10+) or Docker Engine (v20.10+)
- Docker Compose v2
- At least 2GB RAM available for containers

### 1. Development Mode (Recommended for local development)

```bash
# Build and start development environment
npm run docker:compose:dev

# Or manually:
docker compose --profile development up -d
```

**Access the app:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health check: http://localhost:3001/health

### 2. Production Mode (Full stack with nginx proxy)

```bash
# Build and start production environment
npm run docker:compose:prod

# Or manually:
docker compose -f compose.prod.yaml up -d
```

**Access the app:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health check: http://localhost:3000/health

## 🏗️ Build Commands

### Build All Images
```bash
npm run docker:build:all
```

### Build Individual Images
```bash
# Web frontend only
npm run docker:build:web

# Backend API only
npm run docker:build:backend

# Development environment
npm run docker:build:dev

# Electron desktop app
npm run docker:build:electron
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# News API Key (optional, for real DevOps news)
NEWS_API_KEY=your_news_api_key_here

# Server Port
PORT=3001

# Node Environment
NODE_ENV=production
```

### NewsAPI Setup

To enable real DevOps news:

```bash
# Run the setup script
npm run setup:news

# Or manually:
./scripts/setup-news-api.sh
```

Get your free API key from: https://newsapi.org/register

## 🐳 Docker Images

### Multi-Stage Build Targets

1. **`web`** - Production nginx server with built React app
2. **`backend`** - Node.js API server with Ollama integration
3. **`development`** - Development environment with hot reload
4. **`electron`** - Desktop application build

### Image Sizes
- `web`: ~50MB (nginx + built app)
- `backend`: ~200MB (Node.js + dependencies)
- `development`: ~500MB (includes dev dependencies)
- `electron`: ~1GB (includes Chromium)

## 🔄 Management Commands

### Start Services
```bash
# Development
npm run docker:compose:dev

# Production
npm run docker:compose:prod

# Simple web only
npm run docker:compose
```

### Stop Services
```bash
# Stop all services
npm run docker:stop

# Stop production services
npm run docker:stop:prod
```

### View Logs
```bash
# Development logs
npm run docker:logs

# Production logs
npm run docker:logs:prod
```

### Restart Services
```bash
# Restart development
npm run docker:restart

# Restart production
npm run docker:restart:prod
```

### Clean Up
```bash
# Clean containers and images
npm run docker:clean

# Full cleanup (including volumes)
npm run docker:clean:all
```

## 🔍 Health Checks

### Frontend Health Check
```bash
curl http://localhost:3000/health
# Expected: "healthy"
```

### Backend Health Check
```bash
curl http://localhost:3001/health
# Expected: {"status":"healthy","timestamp":"..."}
```

### Container Health Status
```bash
docker compose ps
# Check the "Status" column for health status
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the port
lsof -i :3000
lsof -i :3001
lsof -i :5173

# Kill the process or use different ports
```

#### 2. Permission Issues
```bash
# Fix nginx permissions
docker compose down
docker system prune -f
docker compose up -d
```

#### 3. Build Failures
```bash
# Clean and rebuild
npm run docker:clean:all
npm run docker:build:all
```

#### 4. AI Not Working
```bash
# Check if Ollama is running locally
curl http://localhost:11434/api/tags

# Check backend logs
npm run docker:logs
```

### Debug Commands

```bash
# Check container logs
docker compose logs devops-notes
docker compose logs backend

# Enter container for debugging
docker compose exec devops-notes sh
docker compose exec backend sh

# Check resource usage
docker stats

# Check network connectivity
docker network ls
docker network inspect devops-notes-network
```

## 🔒 Security Features

### Security Headers
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- X-Content-Type-Options: nosniff
- Content-Security-Policy: Comprehensive CSP
- Strict-Transport-Security: HSTS enabled

### Container Security
- Non-root users for all containers
- Read-only filesystems where possible
- Security options enabled
- Resource limits configured

### Network Security
- Isolated Docker networks
- Rate limiting on API endpoints
- CORS properly configured

## 📊 Performance Optimization

### Nginx Optimizations
- Gzip compression enabled
- Static asset caching (1 year)
- HTML caching (1 hour)
- Connection pooling
- Sendfile optimization

### Resource Limits
```yaml
# Production resource limits
devops-notes:
  deploy:
    resources:
      limits:
        memory: 512M
        cpus: '0.5'
      reservations:
        memory: 256M
        cpus: '0.25'

backend:
  deploy:
    resources:
      limits:
        memory: 1G
        cpus: '1.0'
      reservations:
        memory: 512M
        cpus: '0.5'
```

## 🌐 Production Deployment

### SSL/HTTPS Setup

1. **Create nginx-proxy directories:**
```bash
mkdir -p nginx-proxy/{certs,vhost.d,html,conf.d,acme}
```

2. **Update environment variables:**
```bash
# In compose.prod.yaml, update:
- DEFAULT_EMAIL=your-email@example.com
```

3. **Start with SSL:**
```bash
npm run docker:compose:prod
```

### Reverse Proxy Configuration

The production setup includes:
- **nginx-proxy**: Automatic reverse proxy
- **nginx-proxy-acme**: Let's Encrypt SSL certificates
- **Automatic SSL**: Certificates auto-renewed

### Monitoring

```bash
# Check service status
docker compose ps

# Monitor resource usage
docker stats

# View logs in real-time
docker compose logs -f
```

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build and deploy
        run: |
          docker compose -f compose.prod.yaml build
          docker compose -f compose.prod.yaml up -d
```

## 📝 Environment-Specific Configurations

### Development
- Hot reload enabled
- Source maps included
- Debug logging
- Volume mounts for live editing

### Production
- Optimized builds
- Minified assets
- Security headers
- Resource limits
- Health checks
- SSL/TLS support

## 🆘 Support

For issues related to:
- **Docker**: Check Docker Desktop/Engine logs
- **Application**: Check container logs
- **Network**: Verify port availability
- **AI**: Ensure Ollama is running locally
- **News**: Verify NewsAPI key configuration

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Ollama Documentation](https://ollama.ai/docs)
- [NewsAPI Documentation](https://newsapi.org/docs)

## 📁 Project Structure

```
devops-notes/
├── Dockerfile              # Multi-stage Docker build (web + electron)
├── compose.yaml           # Docker Compose configuration (v2)
├── nginx.conf             # Nginx configuration with security headers
├── .dockerignore          # Files to exclude from build
├── scripts/
│   ├── build-docker.sh    # Enhanced build script
│   ├── deploy.sh          # Comprehensive deployment script
│   └── setup-news-api.sh  # NewsAPI setup script
├── src/
│   └── config.js          # API configuration
└── DOCKER_DEPLOYMENT.md   # This file
```

## 🔧 Configuration

### Environment Variables

The application supports the following environment variables:

```bash
NODE_ENV=production        # Set to production for optimized build
NODE_OPTIONS="--max-old-space-size=4096"  # Memory optimization
```

### NewsAPI Configuration

To enable real DevOps news:

```bash
# Quick setup
npm run setup:news

# Or manually edit src/config.js
```

### Port Configuration

Default port mapping:
- Container: 80 (internal)
- Host: 3000 (external)

To change the port, modify `compose.yaml`:

```yaml
ports:
  - "8080:80"  # Change 3000 to your preferred port
```

## 🛠️ Development

### Building for Development

```bash
# Build with development dependencies
docker build --target builder -t devops-notes:dev .

# Run development server
docker run -p 5173:5173 -v $(pwd):/app devops-notes:dev npm run dev
```

### Hot Reload

For development with hot reload:

```bash
# Mount source code for live updates
docker run -p 5173:5173 -v $(pwd):/app -v /app/node_modules devops-notes:dev npm run dev
```

## 🔒 Security

### Security Headers

The nginx configuration includes comprehensive security headers:
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Content-Security-Policy: Restrictive CSP with NewsAPI allowance
- Permissions-Policy: Restrict camera, microphone, geolocation
- Strict-Transport-Security: HSTS for HTTPS

### SSL/TLS (Production)

For production deployment with SSL:

1. Create SSL certificates
2. Mount them in the nginx-proxy service
3. Use the production profile:

```bash
./scripts/deploy.sh deploy:prod
```

## 📊 Monitoring

### Health Checks

The application includes comprehensive health checks:

```bash
# Check container health
docker compose ps

# View health check logs
docker inspect javascript-app | grep -A 10 Health
```

### Logs

```bash
# View application logs
./scripts/deploy.sh logs

# Or manually
docker compose logs -f javascript-app

# View nginx logs
docker compose logs -f nginx-proxy
```

### Performance Monitoring

```bash
# Check resource usage
docker stats

# View container details
docker inspect javascript-app
```

## 🔄 Updates

### Updating the Application

```bash
# Pull latest changes
git pull

# Rebuild and restart
./scripts/deploy.sh clean
./scripts/deploy.sh build
./scripts/deploy.sh deploy
```

### Rolling Updates

```bash
# Zero-downtime deployment
docker compose up -d --no-deps --build javascript-app
```

## 🧹 Cleanup

### Remove Containers and Images

```bash
# Stop and remove containers
./scripts/deploy.sh stop

# Clean everything
./scripts/deploy.sh clean

# Or manually
docker compose down
docker system prune -f
```

### Remove Images

```bash
# Remove specific image
docker rmi electron-devops-notes:latest

# Remove all unused images
docker image prune -a
```

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use**:
   ```bash
   # Check what's using the port
   lsof -i :3000
   
   # Change port in compose.yaml
   ```

2. **Build fails**:
   ```bash
   # Clean and rebuild
   ./scripts/deploy.sh clean
   ./scripts/deploy.sh build
   ```

3. **Container won't start**:
   ```bash
   # Check logs
   ./scripts/deploy.sh logs
   
   # Check container status
   ./scripts/deploy.sh status
   ```

4. **NewsAPI issues**:
   ```bash
   # Check API key configuration
   cat src/config.js
   
   # Re-run setup
   npm run setup:news
   ```

### Debug Mode

```bash
# Run with debug output
docker compose up --verbose

# Check container environment
docker exec -it javascript-app env
```

## 📈 Performance Optimization

### Nginx Optimizations

The nginx configuration includes:
- Gzip compression for all text-based assets
- Long-term caching for static assets
- Performance optimizations (sendfile, tcp_nopush, etc.)
- Worker process tuning

### Container Optimizations

- Multi-stage build for smaller image size
- Non-root user for security
- Health checks for reliability
- Resource limits (configurable)

## 🔗 External Services

### NewsAPI Integration

The application integrates with NewsAPI for real DevOps news:
- Automatic fallback to simulated news if API fails
- Configurable API key via `src/config.js`
- Rate limiting and error handling
- Secure CSP headers for API access

### Future Integrations

Planned integrations:
- Database backend for data persistence
- Authentication system
- Cloud storage for notes
- Real-time collaboration features 