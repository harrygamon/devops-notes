#!/bin/bash

# DevOps Notes Docker Build Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}$1${NC}"
}

print_warning() {
    echo -e "${YELLOW}$1${NC}"
}

print_error() {
    echo -e "${RED}$1${NC}"
}

echo "🚀 Building DevOps Notes Docker Image..."
echo "========================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "❌ Error: Docker is not running or not accessible"
    exit 1
fi

# Parse command line arguments
TARGET=${1:-web}
TAG=${2:-latest}
PUSH=${3:-false}

print_status "🔨 Building $TARGET target with tag: $TAG"

# Build the Docker image with specified target
if docker build --target $TARGET -t electron-devops-notes:$TAG .; then
    print_success "✅ Docker image built successfully!"
    echo ""
    
    # Show available commands based on target
    if [ "$TARGET" = "web" ]; then
        echo "📋 Available commands:"
        echo "  docker run -p 3000:80 electron-devops-notes:$TAG    # Run the container"
        echo "  docker compose up -d                                 # Run with docker compose"
        echo "  docker compose --profile production up -d            # Run with nginx proxy"
        echo "  docker compose logs -f                               # View logs"
        echo "  docker compose down                                  # Stop containers"
        echo ""
        echo "🌐 Access the application at: http://localhost:3000"
    elif [ "$TARGET" = "development" ]; then
        echo "📋 Available commands:"
        echo "  docker run -p 5173:5173 electron-devops-notes:$TAG  # Run development container"
        echo "  docker compose --profile development up -d           # Run with docker compose"
        echo ""
        echo "🌐 Access the development server at: http://localhost:5173"
    elif [ "$TARGET" = "electron" ]; then
        echo "📋 Available commands:"
        echo "  docker run --rm -it --privileged electron-devops-notes:$TAG  # Run Electron app"
        echo ""
        echo "⚠️  Note: Electron requires display access and may need additional setup"
    fi
    
    echo ""
    echo "🔧 Image details:"
    docker images electron-devops-notes:$TAG --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"
    
    # Push to registry if requested
    if [ "$PUSH" = "true" ]; then
        print_status "📤 Pushing image to registry..."
        if docker push electron-devops-notes:$TAG; then
            print_success "✅ Image pushed successfully!"
        else
            print_error "❌ Failed to push image"
            exit 1
        fi
    fi
    
else
    print_error "❌ Error: Docker build failed"
    exit 1
fi 