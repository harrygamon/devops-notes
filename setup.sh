#!/bin/bash

echo "🚀 Setting up DevOps Notes - AI-Powered Development Companion"
echo "=============================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# OpenAI API Key (already configured in server.js)
# OPENAI_API_KEY=your_openai_api_key_here

# News API Key (optional, for real DevOps news)
# Get from https://newsapi.org/register
NEWS_API_KEY=your_news_api_key_here

# Server Port
PORT=3001
EOF
    echo "✅ Created .env file"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start the backend server:"
echo "   npm run server"
echo ""
echo "2. In a new terminal, start the frontend:"
echo "   npm run dev"
echo ""
echo "3. Or run both together:"
echo "   npm run dev-full"
echo ""
echo "4. Access the app at:"
echo "   Frontend: http://localhost:5173"
echo "   Backend: http://localhost:3001"
echo ""
echo "5. For Electron app:"
echo "   npm run electron-dev"
echo ""
echo "Optional - Install Ollama for local AI:"
echo "1. Install Ollama: curl -fsSL https://ollama.ai/install.sh | sh"
echo "2. Pull model: ollama pull llama3.2"
echo "3. Start Ollama: ollama serve"
echo ""
echo "Happy coding! 🚀" 