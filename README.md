# RandomChat - Random Video Chat with Location Filtering

A modern, feature-rich random video chat application that connects people worldwide with location-based filtering and real-time face filters.

## ✨ Features

- 🌍 **Global Connections** - Connect with random people from around the world
- 📍 **Location Filtering** - Filter by Country → State/Region → City
- 🎥 **WebRTC Video Chat** - High-quality peer-to-peer video connections
- ✨ **Face Filters** - Real-time face filters including:
  - Child face effect
  - Girl face effect
  - Blur, Vintage, Cool filters
- 🎨 **Premium UI** - Modern dark theme with glassmorphism and smooth animations
- 🔄 **Skip Feature** - Skip to next random person instantly
- 📱 **Responsive Design** - Works on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Webcam and microphone

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Start the server:**
```bash
npm start
```

3. **Open your browser:**
```
http://localhost:3000
```

## 🎮 How to Use

1. **Select Location:**
   - Choose your preferred country, state, and city
   - Or select "Any Location" to match with anyone worldwide

2. **Start Chatting:**
   - Click "Start Chatting" to begin
   - Allow camera and microphone access when prompted
   - Wait for a match (usually takes a few seconds)

3. **Apply Filters:**
   - Click on any filter button to apply effects to your video
   - Try the Child or Girl face filters for fun transformations

4. **Skip or Disconnect:**
   - Click "Skip" to find a new random person
   - Click "New Chat" to search again with same location
   - Click the disconnect button to return to home

## 🛠️ Technology Stack

### Backend
- **Node.js** - Server runtime
- **Express** - Web server framework
- **Socket.IO** - Real-time WebRTC signaling

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling with glassmorphism and animations
- **Vanilla JavaScript** - Application logic
- **WebRTC** - Peer-to-peer video connections
- **TensorFlow.js** - Face detection (optional, for advanced filters)

### WebRTC Configuration
- Uses Google STUN servers for NAT traversal
- Peer-to-peer connections for low latency
- Automatic reconnection handling

## 📁 Project Structure

```
random-video-chat/
├── server.js                 # Node.js server with Socket.IO
├── package.json             # Dependencies
├── public/
│   ├── index.html          # Main HTML file
│   ├── css/
│   │   └── style.css       # Styles
│   └── js/
│       ├── app.js          # Main app logic
│       ├── webrtc.js       # WebRTC connection handling
│       ├── filters.js      # Face filter implementation
│       └── locations.json  # Location data
└── README.md
```

## 🌐 Deployment

### Deploy to Heroku

1. **Create a Heroku app:**
```bash
heroku create your-app-name
```

2. **Deploy:**
```bash
git push heroku main
```

3. **Open your app:**
```bash
heroku open
```

### Deploy to Railway

1. **Connect your GitHub repository to Railway**
2. **Railway will auto-detect Node.js and deploy**
3. **Your app will be live at: `https://your-app.railway.app`**

### Deploy to Render

1. **Create a new Web Service on Render**
2. **Connect your repository**
3. **Set build command:** `npm install`
4. **Set start command:** `npm start`
5. **Deploy!**

## 🔧 Configuration

### Port Configuration
The server runs on port 3000 by default. To change:
- Set environment variable: `PORT=8080`
- Or modify `server.js`: `const PORT = 8080;`

### STUN/TURN Servers
For better connectivity, you can add TURN servers in `public/js/webrtc.js`:

```javascript
const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        {
            urls: 'turn:your-turn-server.com',
            username: 'username',
            credential: 'password'
        }
    ]
};
```

### Adding More Locations
Edit `public/js/locations.json` to add more countries, states, and cities.

## 🐛 Troubleshooting

### Camera/Microphone Not Working
- Ensure you've granted browser permissions
- Check if another app is using the camera
- Try a different browser
- Make sure you're using HTTPS in production

### Connection Issues
- Check your firewall settings
- Ensure WebRTC is not blocked by your network
- Try using a TURN server for better connectivity

### No Match Found
- Try selecting "Any Location" for more matches
- Wait a bit longer (matching depends on online users)
- Refresh the page and try again

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## ⚠️ Privacy & Safety

- No video/audio is recorded or stored
- All connections are peer-to-peer
- No personal data is collected
- Users should follow community guidelines
- Report inappropriate behavior

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Check the troubleshooting section above

---

**Enjoy connecting with people worldwide! 🌍✨**
