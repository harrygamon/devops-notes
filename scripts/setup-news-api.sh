#!/bin/bash

echo "🔧 Setting up NewsAPI.org for DevOps News"
echo "=========================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file..."
    touch .env
fi

# Check if NEWS_API_KEY already exists
if grep -q "NEWS_API_KEY" .env; then
    echo "⚠️  NEWS_API_KEY already exists in .env file"
    echo "Current value: $(grep NEWS_API_KEY .env | cut -d'=' -f2)"
    read -p "Do you want to update it? (y/n): " update_key
    if [ "$update_key" != "y" ]; then
        echo "Keeping existing key."
        exit 0
    fi
fi

echo ""
echo "📰 To get a NewsAPI.org key:"
echo "1. Go to https://newsapi.org/"
echo "2. Sign up for a free account"
echo "3. Get your API key from the dashboard"
echo "4. The free tier allows 1000 requests per day"
echo ""

read -p "Enter your NewsAPI.org API key: " api_key

if [ -z "$api_key" ]; then
    echo "❌ No API key provided. Setup cancelled."
    exit 1
fi

# Remove existing NEWS_API_KEY if it exists
sed -i '/NEWS_API_KEY/d' .env

# Add the new API key
echo "NEWS_API_KEY=$api_key" >> .env

echo ""
echo "✅ NewsAPI.org key configured successfully!"
echo "📁 Added to .env file"
echo ""
echo "🚀 You can now use the DevOps News page with real news from NewsAPI.org"
echo "💡 The app will fall back to simulated news if the API is unavailable" 