#!/bin/bash
# Deployment Script for Random Video Chat

echo "==================================="
echo "Random Video Chat - Deployment"
echo "==================================="
echo ""

# Step 1: Check if Git is initialized
if [ ! -d .git ]; then
    echo "❌ Git not initialized. Run: git init"
    exit 1
fi

echo "✅ Git repository found"
echo ""

# Step 2: Ask for GitHub repository URL
echo "Please create a GitHub repository at: https://github.com/new"
echo "Repository name: random-video-chat"
echo "Make it PUBLIC and DON'T add README"
echo ""
read -p "Enter your GitHub repository URL (e.g., https://github.com/username/random-video-chat.git): " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ No repository URL provided"
    exit 1
fi

# Step 3: Add remote and push
echo ""
echo "📤 Adding remote and pushing to GitHub..."
git remote add origin "$REPO_URL" 2>/dev/null || git remote set-url origin "$REPO_URL"
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo "✅ Code pushed to GitHub successfully!"
    echo ""
    echo "==================================="
    echo "Next Steps:"
    echo "==================================="
    echo "1. Go to: https://render.com"
    echo "2. Click 'New +' → 'Web Service'"
    echo "3. Connect your GitHub account"
    echo "4. Select repository: random-video-chat"
    echo "5. Use these settings:"
    echo "   - Name: randomchat"
    echo "   - Environment: Node"
    echo "   - Build Command: npm install"
    echo "   - Start Command: npm start"
    echo "   - Plan: Free"
    echo "6. Click 'Create Web Service'"
    echo ""
    echo "Your app will be live at: https://randomchat.onrender.com"
    echo "(or similar URL shown in Render dashboard)"
    echo "==================================="
else
    echo "❌ Failed to push to GitHub"
    echo "Please check your repository URL and try again"
    exit 1
fi
