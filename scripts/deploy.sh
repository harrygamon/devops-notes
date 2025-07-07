#!/bin/bash

# DevOps Notes Deployment Script
# Usage: ./scripts/deploy.sh [environment] [version]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=${1:-production}
VERSION=${2:-latest}
GITHUB_REPOSITORY=${GITHUB_REPOSITORY:-your-username/electron-devops-notes}

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to validate environment
validate_environment() {
    case $ENVIRONMENT in
        production|staging|development)
            print_status "Deploying to $ENVIRONMENT environment"
            ;;
        *)
            print_error "Invalid environment: $ENVIRONMENT"
            print_error "Valid environments: production, staging, development"
            exit 1
            ;;
    esac
}

# Function to set environment variables
set_environment_vars() {
    print_status "Setting environment variables..."
    
    export GITHUB_REPOSITORY=$GITHUB_REPOSITORY
    
    case $ENVIRONMENT in
        production)
            export COMPOSE_FILE=compose.prod.yaml
            export COMPOSE_PROJECT_NAME=devops-notes-prod
            ;;
        staging)
            export COMPOSE_FILE=compose.yaml
            export COMPOSE_PROJECT_NAME=devops-notes-staging
            ;;
        development)
            export COMPOSE_FILE=compose.yaml
            export COMPOSE_PROJECT_NAME=devops-notes-dev
            ;;
    esac
    
    print_success "Environment variables set"
}

# Function to pull latest images
pull_images() {
    print_status "Pulling latest Docker images..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        # Pull from GitHub Container Registry
        docker pull ghcr.io/$GITHUB_REPOSITORY-web:$VERSION || {
            print_warning "Failed to pull web image, building locally..."
            docker build --target web -t ghcr.io/$GITHUB_REPOSITORY-web:$VERSION .
        }
        
        docker pull ghcr.io/$GITHUB_REPOSITORY-backend:$VERSION || {
            print_warning "Failed to pull backend image, building locally..."
            docker build --target backend -t ghcr.io/$GITHUB_REPOSITORY-backend:$VERSION .
        }
    else
        # Build locally for staging/development
        print_status "Building images locally..."
        docker build --target web -t electron-devops-notes:$VERSION .
        docker build --target backend -t electron-devops-notes-backend:$VERSION .
    fi
    
    print_success "Images ready"
}

# Function to backup current deployment
backup_deployment() {
    print_status "Creating backup of current deployment..."
    
    if docker compose ps | grep -q "Up"; then
        docker compose down --timeout 30 || true
        print_success "Current deployment stopped"
    fi
    
    # Create backup of data volumes if they exist
    if docker volume ls | grep -q "devops-notes"; then
        docker run --rm -v devops-notes-data:/data -v $(pwd):/backup alpine tar czf /backup/backup-$(date +%Y%m%d-%H%M%S).tar.gz -C /data . || true
        print_success "Data backup created"
    fi
}

# Function to deploy application
deploy_application() {
    print_status "Deploying application..."
    
    case $ENVIRONMENT in
        production)
            docker compose -f compose.prod.yaml --profile production up -d
            ;;
        staging)
            docker compose up -d
            ;;
        development)
            docker compose --profile development up -d
            ;;
    esac
    
    print_success "Application deployed"
}

# Function to wait for health checks
wait_for_health() {
    print_status "Waiting for services to be healthy..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker compose ps | grep -q "healthy"; then
            print_success "All services are healthy"
            return 0
        fi
        
        print_status "Attempt $attempt/$max_attempts - Waiting for services to be healthy..."
        sleep 10
        attempt=$((attempt + 1))
    done
    
    print_warning "Some services may not be healthy, but deployment completed"
    return 1
}

# Function to show deployment status
show_status() {
    print_status "Deployment status:"
    docker compose ps
    
    print_status "Recent logs:"
    docker compose logs --tail=20
}

# Function to run post-deployment checks
post_deployment_checks() {
    print_status "Running post-deployment checks..."
    
    # Check if web service is responding
    local web_url="http://localhost:3000"
    if [ "$ENVIRONMENT" = "production" ]; then
        web_url="http://localhost"
    fi
    
    if curl -f -s "$web_url/health" > /dev/null; then
        print_success "Web service is responding"
    else
        print_warning "Web service health check failed"
    fi
    
    # Check if backend service is responding
    if curl -f -s "http://localhost:3001/health" > /dev/null; then
        print_success "Backend service is responding"
    else
        print_warning "Backend service health check failed"
    fi
}

# Function to cleanup old images
cleanup_old_images() {
    print_status "Cleaning up old Docker images..."
    
    # Remove dangling images
    docker image prune -f
    
    # Remove images older than 7 days (keep last 5)
    docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}" | grep "electron-devops-notes" | head -n -5 | awk '{print $1 ":" $2}' | xargs -r docker rmi || true
    
    print_success "Cleanup completed"
}

# Main deployment function
main() {
    print_status "Starting deployment to $ENVIRONMENT environment (version: $VERSION)"
    
    check_prerequisites
    validate_environment
    set_environment_vars
    backup_deployment
    pull_images
    deploy_application
    wait_for_health
    show_status
    post_deployment_checks
    cleanup_old_images
    
    print_success "Deployment completed successfully!"
    print_status "Access your application at:"
    
    case $ENVIRONMENT in
        production)
            echo "  - Web: http://localhost"
            echo "  - Backend: http://localhost:3001"
            ;;
        staging|development)
            echo "  - Web: http://localhost:3000"
            echo "  - Backend: http://localhost:3001"
            ;;
    esac
    
    echo ""
    print_status "Basic Auth credentials:"
    echo "  - Username: harry"
    echo "  - Password: supersecurepassword"
    echo ""
    print_status "AI Assistant available at: /ai-assistant"
}

# Run main function
main "$@" 