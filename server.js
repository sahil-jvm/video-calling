const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.static('public'));

// Store online users with their location preferences
const onlineUsers = new Map();
// Store waiting users looking for a match
const waitingUsers = new Map();
// Store active connections
const activeConnections = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User sets their location and starts searching
  socket.on('find-match', (locationData) => {
    console.log('User searching for match:', socket.id, locationData);
    
    onlineUsers.set(socket.id, {
      socketId: socket.id,
      location: locationData,
      timestamp: Date.now()
    });

    // Try to find a match
    findMatch(socket, locationData);
  });

  // WebRTC signaling
  socket.on('offer', (data) => {
    console.log('Offer from', socket.id, 'to', data.to);
    io.to(data.to).emit('offer', {
      offer: data.offer,
      from: socket.id
    });
  });

  socket.on('answer', (data) => {
    console.log('Answer from', socket.id, 'to', data.to);
    io.to(data.to).emit('answer', {
      answer: data.answer,
      from: socket.id
    });
  });

  socket.on('ice-candidate', (data) => {
    io.to(data.to).emit('ice-candidate', {
      candidate: data.candidate,
      from: socket.id
    });
  });

  // Skip current partner and find new match
  socket.on('skip', () => {
    console.log('User skipping:', socket.id);
    disconnectUser(socket.id);
    
    // Get user's location preference
    const user = onlineUsers.get(socket.id);
    if (user) {
      findMatch(socket, user.location);
    }
  });

  // User disconnects
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    disconnectUser(socket.id);
  });

  socket.on('disconnect-call', () => {
    console.log('User ended call:', socket.id);
    disconnectUser(socket.id);
  });
});

function findMatch(socket, locationData) {
  const currentUserId = socket.id;
  
  // Remove from waiting if already there
  waitingUsers.delete(currentUserId);
  
  // Look for a waiting user with matching location
  let matchFound = false;
  
  for (const [waitingUserId, waitingUserData] of waitingUsers.entries()) {
    // Skip if it's the same user
    if (waitingUserId === currentUserId) continue;
    
    // Check if locations match
    if (locationsMatch(locationData, waitingUserData.location)) {
      // Match found!
      console.log('Match found:', currentUserId, 'with', waitingUserId);
      
      // Remove from waiting
      waitingUsers.delete(waitingUserId);
      
      // Store active connection
      activeConnections.set(currentUserId, waitingUserId);
      activeConnections.set(waitingUserId, currentUserId);
      
      // Notify both users
      socket.emit('match-found', { partnerId: waitingUserId });
      io.to(waitingUserId).emit('match-found', { partnerId: currentUserId });
      
      matchFound = true;
      break;
    }
  }
  
  if (!matchFound) {
    // Add to waiting list
    waitingUsers.set(currentUserId, {
      socketId: currentUserId,
      location: locationData,
      timestamp: Date.now()
    });
    
    socket.emit('waiting', { message: 'Searching for a match...' });
    console.log('User added to waiting list:', currentUserId);
  }
}

function locationsMatch(loc1, loc2) {
  // If either user selected "Any Location", match them
  if (loc1.country === 'any' || loc2.country === 'any') {
    return true;
  }
  
  // Match by country
  if (loc1.country !== loc2.country) {
    return false;
  }
  
  // If either selected "Any" state/city within the country, match them
  if (loc1.state === 'any' || loc2.state === 'any') {
    return true;
  }
  
  // Match by state
  if (loc1.state !== loc2.state) {
    return false;
  }
  
  // If either selected "Any" city within the state, match them
  if (loc1.city === 'any' || loc2.city === 'any') {
    return true;
  }
  
  // Match by city
  return loc1.city === loc2.city;
}

function disconnectUser(userId) {
  // Find partner if in active connection
  const partnerId = activeConnections.get(userId);
  
  if (partnerId) {
    // Notify partner
    io.to(partnerId).emit('partner-disconnected');
    
    // Remove both from active connections
    activeConnections.delete(userId);
    activeConnections.delete(partnerId);
  }
  
  // Remove from waiting list
  waitingUsers.delete(userId);
  
  // Remove from online users
  onlineUsers.delete(userId);
}

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});
