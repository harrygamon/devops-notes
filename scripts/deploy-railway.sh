#!/bin/bash

# Railway Deployment Script for DevOps Notes
# This script helps deploy and manage your app on Railway

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if Railway CLI is installed
check_railway_cli() {
    if ! command -v railway &> /dev/null; then
        print_error "Railway CLI is not installed."
        print_status "Installing Railway CLI..."
        curl -fsSL https://railway.app/install.sh | sh
        export PATH="$HOME/.local/bin:$PATH"
        print_success "Railway CLI installed successfully!"
    else
        print_success "Railway CLI is already installed."
    fi
}

# Login to Railway
login_railway() {
    print_status "Logging in to Railway..."
    if [ -z "$RAILWAY_TOKEN" ]; then
        print_warning "RAILWAY_TOKEN not set. Please login manually:"
        railway login
    else
        railway login --token "$RAILWAY_TOKEN"
    fi
    print_success "Logged in to Railway successfully!"
}

# Deploy to Railway
deploy() {
    print_status "Starting deployment to Railway..."
    
    # Check if project is linked
    if [ -z "$RAILWAY_PROJECT_ID" ]; then
        print_warning "RAILWAY_PROJECT_ID not set. Please link your project first:"
        railway link
    else
        railway link --project "$RAILWAY_PROJECT_ID"
    fi
    
    # Deploy the application
    print_status "Deploying application..."
    railway up --service devops-notes-web
    
    print_success "Deployment completed successfully!"
    
    # Get deployment URL
    DEPLOY_URL=$(railway status --json | jq -r '.services[0].url' 2>/dev/null || echo "Unknown")
    print_success "Your app is live at: $DEPLOY_URL"
}

# Show deployment status
status() {
    print_status "Checking deployment status..."
    railway status
}

# Show logs
logs() {
    print_status "Fetching application logs..."
    railway logs
}

# Open app in browser
open_app() {
    print_status "Opening application in browser..."
    railway open
}

# Rollback to previous deployment
rollback() {
    print_status "Rolling back to previous deployment..."
    railway rollback
    print_success "Rollback completed!"
}

# Show help
show_help() {
    echo "Railway Deployment Script for DevOps Notes"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  deploy    - Deploy the application to Railway"
    echo "  status    - Show deployment status"
    echo "  logs      - Show application logs"
    echo "  open      - Open app in browser"
    echo "  rollback  - Rollback to previous deployment"
    echo "  help      - Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  RAILWAY_TOKEN      - Your Railway authentication token"
    echo "  RAILWAY_PROJECT_ID - Your Railway project ID"
    echo ""
    echo "Examples:"
    echo "  $0 deploy"
    echo "  $0 status"
    echo "  $0 logs"
}

# Main script logic
main() {
    case "${1:-help}" in
        "deploy")
            check_railway_cli
            login_railway
            deploy
            ;;
        "status")
            check_railway_cli
            login_railway
            status
            ;;
        "logs")
            check_railway_cli
            login_railway
            logs
            ;;
        "open")
            check_railway_cli
            login_railway
            open_app
            ;;
        "rollback")
            check_railway_cli
            login_railway
            rollback
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@" 