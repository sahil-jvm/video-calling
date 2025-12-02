# SIMPLE DEPLOYMENT GUIDE - Get Your URL in 10 Minutes!

## 🚀 Quick Deploy (Follow These Exact Steps)

### Step 1: Create GitHub Repository (2 minutes)

1. **Open this link**: https://github.com/new
2. **Log in** to GitHub (if not already)
3. **Fill in**:
   - Repository name: `random-video-chat`
   - Make it **Public**
   - **DON'T** check "Add a README file"
4. **Click** "Create repository"
5. **Copy** the repository URL (looks like: `https://github.com/YOUR_USERNAME/random-video-chat.git`)

---

### Step 2: Push Code to GitHub (2 minutes)

Open **PowerShell** or **Command Prompt** in `C:\Users\user\Desktop\gravity` and run:

```powershell
# Replace YOUR_GITHUB_URL with the URL you copied
git remote add origin YOUR_GITHUB_URL
git branch -M main
git push -u origin main
```

**Example:**
```powershell
git remote add origin https://github.com/sahilkumar702754/random-video-chat.git
git branch -M main
git push -u origin main
```

If it asks for credentials, enter your GitHub username and password (or personal access token).

---

### Step 3: Deploy to Render.com (5 minutes)

1. **Go to**: https://render.com
2. **Sign up / Log in** (can use GitHub account)
3. **Click**: "New +" button (top right)
4. **Select**: "Web Service"
5. **Click**: "Connect GitHub" (if not connected)
6. **Select**: Your `random-video-chat` repository
7. **Fill in**:
   ```
   Name: randomchat
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   Plan: Free
   ```
8. **Click**: "Create Web Service"

---

### Step 4: Get Your URL! 🎉

- Render will deploy your app (takes 3-5 minutes)
- You'll see a URL like: **`https://randomchat.onrender.com`**
- **Copy this URL** and share with your friend!

---

## 🎮 How to Test

1. **You**: Open the Render URL
2. **Friend**: Open the same Render URL
3. **Both**: Select the same location (or "Any Location")
4. **Both**: Click "Start Chatting"
5. **Both**: Allow camera/microphone
6. **You'll match and connect!**

---

## ⚡ Alternative: Deploy to Railway (Even Easier!)

If Render doesn't work, try Railway:

1. **Go to**: https://railway.app
2. **Sign up** with GitHub
3. **Click**: "New Project" → "Deploy from GitHub repo"
4. **Select**: `random-video-chat`
5. **Done!** Railway auto-deploys and gives you a URL

---

## 🆘 Need Help?

### If Git push fails:
```powershell
# Remove old remote and try again
git remote remove origin
git remote add origin YOUR_GITHUB_URL
git push -u origin main
```

### If GitHub asks for password:
- Use a **Personal Access Token** instead of password
- Create one at: https://github.com/settings/tokens
- Use token as password when prompted

### If deployment fails:
- Check Render logs for errors
- Make sure `package.json` has correct start command
- Try Railway as alternative

---

## 📋 Checklist

- [ ] Created GitHub repository
- [ ] Copied repository URL
- [ ] Pushed code to GitHub (`git push`)
- [ ] Signed up on Render.com
- [ ] Created Web Service
- [ ] Got deployment URL
- [ ] Tested with friend

---

## 🎯 Your Final URL Will Look Like:

- **Render**: `https://randomchat.onrender.com`
- **Railway**: `https://random-video-chat-production.up.railway.app`
- **Vercel**: `https://random-video-chat.vercel.app`

**Share this URL with your friend and start chatting!** 🚀
