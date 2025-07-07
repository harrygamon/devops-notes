# DevOps Notes - AI-Powered Development Companion

A modern, full-featured DevOps notes application with AI assistance, built with Electron, React, and Vite.

## Features

- 📝 **Smart Note Taking** - Create, organize, and manage DevOps notes with intelligent tagging
- 🤖 **AI Code Reviewer** - Get instant feedback and suggestions for your code and configurations
- ❓ **AI DevOps Assistant** - Ask questions and get expert DevOps guidance powered by AI
- 📰 **DevOps News** - Latest news and trends in DevOps tools and practices
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🐳 **Docker Ready** - Full Docker support for development and production
- 🔐 **Basic Auth**: Secure access with username/password authentication
- 🚀 **CI/CD Pipeline**: Automated testing, building, and deployment

## AI Providers

The app uses local Ollama AI models for all AI functionality:

- **Ollama** - Local AI models (qwen2.5-coder:latest)
- **No API keys required** - Everything runs locally
- **Unlimited usage** - No rate limits or quotas

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Docker (optional, for containerized deployment)

### Development Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd electron-devops-notes
   npm install
   ```

2. **Start the backend server:**
   ```bash
   npm run server
   ```
   The backend server will run on `http://localhost:3001`

3. **Start the frontend development server:**
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

4. **Run in Electron (optional):**
   ```bash
   npm run electron-dev
   ```

### AI Setup

The app uses local Ollama AI models. No API keys are required!

1. **Install Ollama:**
   ```bash
   # macOS/Linux
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Windows
   # Download from https://ollama.ai/download
   ```

2. **Pull the required model:**
   ```bash
   ollama pull qwen2.5-coder:latest
   ```

3. **Start Ollama:**
   ```bash
   ollama serve
   ```

4. **The app will automatically use Ollama** - no configuration needed!

### News API Setup (Optional)

For real DevOps news instead of simulated news:

1. **Get a free API key:**
   - Visit https://newsapi.org/register
   - Sign up for a free account
   - Copy your API key

2. **Configure the API key:**
   ```bash
   npm run setup:news
   ```
   Or manually add to `.env` file:
   ```env
   NEWS_API_KEY=your_api_key_here
   ```

3. **Restart the server** to apply changes

### Production Deployment

#### Docker Deployment

1. **Build the Docker image:**
   ```bash
   npm run docker:build
   ```

2. **Run with Docker Compose:**
   ```bash
   # Development
   npm run docker:compose
   
   # Production with nginx proxy
   npm run docker:compose:prod
   ```

3. **Access the application:**
   - Development: `http://localhost:3000`
   - Production: `http://localhost:80`

#### Manual Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start the backend server:**
   ```bash
   npm run server
   ```

3. **Serve the frontend:**
   ```bash
   npm run preview
   ```

## Project Structure

```
electron-devops-notes/
├── src/                    # Frontend React application
│   ├── App.jsx            # Main application component
│   ├── App.css            # Application styles
│   └── main.jsx           # React entry point
├── server.js              # Backend Express server
├── main.js                # Electron main process
├── package.json           # Dependencies and scripts
├── vite.config.js         # Vite configuration
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose configuration
└── README.md              # This file
```

## Available Scripts

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run electron` - Run Electron app
- `npm run electron-dev` - Run Electron with development server
- `npm run server` - Start backend server
- `npm run server-dev` - Start backend server with nodemon
- `npm run dev-full` - Start both frontend and backend
- `npm run docker:build` - Build Docker image
- `npm run docker:deploy` - Deploy with Docker
- `npm run docker:compose` - Run with Docker Compose
- `npm run docker:compose:prod` - Run production with nginx

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# News API Key (optional, for real DevOps news)
NEWS_API_KEY=your_news_api_key_here

# Server Port
PORT=3001
```

### API Keys

- **News API**: Optional, for real DevOps news (get from https://newsapi.org/register)
- **No AI API keys required** - Uses local Ollama models

## Features in Detail

### Smart Note Taking
- Create and edit notes with rich text
- Automatic tag extraction from content
- Search and filter notes by tags
- Local storage persistence

### AI Code Reviewer
- Paste code or configuration files
- Get instant AI-powered feedback
- Suggestions for improvements
- Security and best practices analysis

### AI DevOps Assistant
- Chat-like interface with conversation history
- Uses local Ollama AI models
- Context-aware responses
- Quick question suggestions

### DevOps News
- Real-time DevOps news and trends
- Fallback to curated content
- Click to read full articles
- Automatic refresh

## Basic Auth

The application is protected with Basic Authentication:

- **Username**: `harry`
- **Password**: `supersecurepassword`

To change the credentials:

1. Generate new password hash:
   ```bash
   docker run --rm httpd:2.4 htpasswd -nbB <username> <password>
   ```

2. Update `.htpasswd` file with the new hash

3. Restart the containers:
   ```bash
   docker compose down && docker compose up -d
   ```

## AI Assistant

Access the AI Assistant at `/ai-assistant` route. It requires:
- Ollama running locally on port 11434
- Qwen3 model installed: `ollama pull qwen2.5:3b`

## Development

### Local Development
```bash
npm run dev          # Start Vite dev server
npm run server       # Start backend server
npm run dev-full     # Start both frontend and backend
```

### Docker Development
```bash
docker compose --profile development up -d
```

## Production Deployment

### Docker Compose
```bash
docker compose -f compose.prod.yaml up -d
```

### Manual Build
```bash
npm run docker:build:all
docker compose up -d
```

## Project Structure

```
├── src/
│   ├── components/     # React components
│   │   ├── Chatbot.jsx # AI Assistant UI
│   │   └── Chatbot.css
│   ├── pages/         # Page components
│   │   └── AIPage.jsx # AI Assistant page
│   ├── App.jsx        # Main app with routing
│   └── main.jsx       # App entry point
├── .github/
│   └── workflows/     # GitHub Actions workflows
│       ├── ci-cd.yml  # Main CI/CD pipeline
│       ├── release.yml # Release workflow
│       ├── security.yml # Security scanning
│       └── dependency-review.yml # Dependency review
├── scripts/
│   └── deploy.sh      # Deployment script
├── server.js          # Backend API server
├── nginx.conf         # NGINX configuration
├── compose.yaml       # Docker Compose services
├── compose.prod.yaml  # Production Docker Compose
├── .htpasswd          # Basic Auth credentials
└── Dockerfile         # Multi-stage Docker build
```

## API Endpoints

- `GET /api/news` - Fetch DevOps news
- `POST /api/chat` - AI chat endpoint
- `GET /health` - Health check

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

The CI/CD pipeline will automatically:
- Run linting and tests
- Build Docker images
- Perform security scans
- Deploy to staging (if on develop branch)

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section in the documentation
2. Search existing issues
3. Create a new issue with detailed information

---

**Note**: This is a personal development tool. The OpenAI API key is configured for personal use. For production deployments, consider using environment variables for API key management.

## CI/CD Pipeline

This project includes a comprehensive CI/CD pipeline using GitHub Actions:

### Workflows

#### 🔄 Main CI/CD Pipeline (`.github/workflows/ci-cd.yml`)
- **Triggers**: Push to main/develop, pull requests
- **Jobs**:
  - **Lint & Test**: Code linting and testing
  - **Build**: Multi-platform Docker image builds
  - **Security Scan**: Vulnerability scanning with Trivy
  - **Deploy**: Automatic deployment to staging/production

#### 🏷️ Release Workflow (`.github/workflows/release.yml`)
- **Triggers**: Git tags (v*)
- **Actions**:
  - Build and push Docker images to GitHub Container Registry
  - Create GitHub releases with changelog
  - Tag images with version numbers

#### 🔒 Security Workflow (`.github/workflows/security.yml`)
- **Triggers**: Weekly schedule, push events
- **Scans**:
  - Trivy vulnerability scanning
  - npm audit for dependencies
  - Snyk security analysis
  - Container image scanning

#### 📦 Dependency Review (`.github/workflows/dependency-review.yml`)
- **Triggers**: Pull requests
- **Purpose**: Automatically review dependency changes for security

### Deployment Environments

#### Development
```bash
# Local development
npm run dev
npm run server

# Docker development
docker compose --profile development up -d
```

#### Staging
```bash
# Deploy to staging
./scripts/deploy.sh staging

# Or manually
docker compose up -d
```

#### Production
```bash
# Deploy to production
./scripts/deploy.sh production

# Or manually
docker compose -f compose.prod.yaml --profile production up -d
```

### GitHub Container Registry

Images are automatically pushed to GitHub Container Registry:
- `ghcr.io/your-username/electron-devops-notes-web:latest`
- `ghcr.io/your-username/electron-devops-notes-backend:latest`

### Environment Variables

Set these in your GitHub repository secrets:
- `GITHUB_TOKEN`: Automatically provided
- `SNYK_TOKEN`: For Snyk security scans (optional)
- `LETSENCRYPT_EMAIL`: For SSL certificates

### Deployment Script

Use the included deployment script for easy deployments:

```bash
# Deploy to production with latest version
./scripts/deploy.sh production

# Deploy to staging with specific version
./scripts/deploy.sh staging v1.2.3

# Deploy to development
./scripts/deploy.sh development
```
