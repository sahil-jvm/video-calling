# Quick Deployment Guide to Render.com

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository (name it something like `random-video-chat`)
3. **Don't** initialize with README (we already have one)
4. Copy the repository URL

## Step 2: Push Code to GitHub

Run these commands in your terminal:

```bash
git remote add origin YOUR_GITHUB_REPO_URL
git branch -M main
git push -u origin main
```

Replace `YOUR_GITHUB_REPO_URL` with your actual GitHub repository URL.

## Step 3: Deploy to Render.com

1. Go to https://render.com and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub account if not already connected
4. Select your `random-video-chat` repository
5. Configure the service:
   - **Name**: `randomchat` (or any name you prefer)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
6. Click "Create Web Service"

## Step 4: Wait for Deployment

- Render will automatically deploy your app
- This takes about 2-5 minutes
- You'll get a URL like: `https://randomchat.onrender.com`

## Step 5: Test Your App

1. Open the Render URL in your browser
2. Share the URL with your friend
3. Both of you select the same location
4. Click "Start Chatting" and you should match!

## Important Notes

### HTTPS is Automatic
- Render provides free HTTPS
- WebRTC requires HTTPS in production (Render handles this automatically)

### Free Tier Limitations
- App may sleep after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- Upgrade to paid plan ($7/month) for always-on service

### Testing with Friends
1. Both users need to be on the site at the same time
2. Select the same location or use "Any Location"
3. Click "Start Chatting" within a few seconds of each other
4. You should match and connect!

### Troubleshooting

**If you don't match:**
- Make sure both users selected compatible locations
- Try selecting "Any Location" on both sides
- Refresh the page and try again

**If video doesn't connect:**
- Allow camera/microphone permissions
- Check your firewall settings
- Try a different browser (Chrome works best)

**If the app is slow:**
- Free tier apps sleep when inactive
- Wait 30 seconds for the app to wake up
- Consider upgrading to paid tier for better performance

## Alternative: Deploy to Railway.app

If you prefer Railway (also free):

1. Go to https://railway.app
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Railway auto-detects Node.js and deploys
6. Get your URL from the Railway dashboard

## Alternative: Deploy to Vercel

For Vercel deployment:

1. Go to https://vercel.com
2. Import your GitHub repository
3. Vercel will auto-detect and deploy
4. Note: Vercel is better for static sites; Render/Railway are better for WebSocket apps

---

**Recommended: Use Render.com** - It's the easiest and most reliable for this type of application.
