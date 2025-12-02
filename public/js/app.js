// Main application logic
let socket;
let locationsData;
let selectedLocation = {
    country: '',
    state: '',
    city: ''
};

// DOM Elements
const landingPage = document.getElementById('landing-page');
const chatInterface = document.getElementById('chat-interface');
const countrySelect = document.getElementById('country-select');
const stateSelect = document.getElementById('state-select');
const citySelect = document.getElementById('city-select');
const stateGroup = document.getElementById('state-group');
const cityGroup = document.getElementById('city-group');
const startChatBtn = document.getElementById('start-chat-btn');
const skipBtn = document.getElementById('skip-btn');
const newChatBtn = document.getElementById('new-chat-btn');
const disconnectBtn = document.getElementById('disconnect-btn');
const statusIndicator = document.getElementById('status-indicator');
const waitingMessage = document.getElementById('waiting-message');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadLocations();
    setupEventListeners();
    connectSocket();
});

// Load location data
async function loadLocations() {
    try {
        const response = await fetch('/js/locations.json');
        locationsData = await response.json();
        populateCountries();
    } catch (error) {
        console.error('Error loading locations:', error);
        countrySelect.innerHTML = '<option value="">Error loading locations</option>';
    }
}

// Populate country dropdown
function populateCountries() {
    countrySelect.innerHTML = '<option value="">Select Country</option>';
    locationsData.countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country.id;
        option.textContent = country.name;
        countrySelect.appendChild(option);
    });
}

// Populate state dropdown
function populateStates(countryId) {
    const country = locationsData.countries.find(c => c.id === countryId);

    if (!country || country.id === 'any' || country.states.length === 0) {
        stateGroup.style.display = 'none';
        cityGroup.style.display = 'none';
        return;
    }

    stateSelect.innerHTML = '<option value="">Select State</option>';
    country.states.forEach(state => {
        const option = document.createElement('option');
        option.value = state.id;
        option.textContent = state.name;
        stateSelect.appendChild(option);
    });

    stateGroup.style.display = 'block';
    cityGroup.style.display = 'none';
}

// Populate city dropdown
function populateCities(countryId, stateId) {
    const country = locationsData.countries.find(c => c.id === countryId);
    if (!country) return;

    const state = country.states.find(s => s.id === stateId);

    if (!state || state.id === 'any' || state.cities.length === 0) {
        cityGroup.style.display = 'none';
        return;
    }

    citySelect.innerHTML = '<option value="">Select City</option>';
    state.cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city.id;
        option.textContent = city.name;
        citySelect.appendChild(option);
    });

    cityGroup.style.display = 'block';
}

// Setup event listeners
function setupEventListeners() {
    countrySelect.addEventListener('change', (e) => {
        selectedLocation.country = e.target.value;
        selectedLocation.state = '';
        selectedLocation.city = '';
        populateStates(e.target.value);
    });

    stateSelect.addEventListener('change', (e) => {
        selectedLocation.state = e.target.value;
        selectedLocation.city = '';
        populateCities(selectedLocation.country, e.target.value);
    });

    citySelect.addEventListener('change', (e) => {
        selectedLocation.city = e.target.value;
    });

    startChatBtn.addEventListener('click', startChat);
    skipBtn.addEventListener('click', skipPartner);
    newChatBtn.addEventListener('click', findNewMatch);
    disconnectBtn.addEventListener('click', disconnectChat);
}

// Connect to Socket.IO server
function connectSocket() {
    socket = io();

    socket.on('connect', () => {
        console.log('Connected to server');
    });

    socket.on('waiting', (data) => {
        console.log('Waiting for match:', data);
        updateStatus('Searching for match...');
        showWaitingOverlay(true);
    });

    socket.on('match-found', (data) => {
        console.log('Match found:', data);
        updateStatus('Connected');
        showWaitingOverlay(false);
        handleMatchFound(data.partnerId);
    });

    socket.on('partner-disconnected', () => {
        console.log('Partner disconnected');
        updateStatus('Partner disconnected');
        handlePartnerDisconnected();
    });

    // WebRTC signaling events
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);
}

// Start chat
function startChat() {
    if (!selectedLocation.country) {
        alert('Please select a country');
        return;
    }

    // Set defaults for unselected options
    const location = {
        country: selectedLocation.country,
        state: selectedLocation.state || 'any',
        city: selectedLocation.city || 'any'
    };

    // Switch to chat interface
    landingPage.style.display = 'none';
    chatInterface.style.display = 'flex';

    // Initialize media and find match
    initializeMedia().then(() => {
        socket.emit('find-match', location);
    }).catch(error => {
        console.error('Error accessing media:', error);
        alert('Please allow camera and microphone access to use this app');
        returnToLanding();
    });
}

// Skip current partner
function skipPartner() {
    socket.emit('skip');
    updateStatus('Searching for new match...');
    showWaitingOverlay(true);
    closeConnection();
}

// Find new match
function findNewMatch() {
    const location = {
        country: selectedLocation.country,
        state: selectedLocation.state || 'any',
        city: selectedLocation.city || 'any'
    };

    socket.emit('find-match', location);
    updateStatus('Searching for match...');
    showWaitingOverlay(true);
    closeConnection();
}

// Disconnect chat
function disconnectChat() {
    socket.emit('disconnect-call');
    stopMedia();
    returnToLanding();
}

// Return to landing page
function returnToLanding() {
    chatInterface.style.display = 'none';
    landingPage.style.display = 'flex';
    closeConnection();
}

// Update status indicator
function updateStatus(status) {
    statusIndicator.textContent = status;
}

// Show/hide waiting overlay
function showWaitingOverlay(show) {
    const overlay = document.querySelector('.video-overlay');
    overlay.style.display = show ? 'flex' : 'none';
}

// Handle partner disconnected
function handlePartnerDisconnected() {
    showWaitingOverlay(true);
    const message = waitingMessage.querySelector('p');
    message.textContent = 'Partner disconnected. Searching for new match...';

    setTimeout(() => {
        message.textContent = 'Searching for someone to chat with...';
        findNewMatch();
    }, 2000);
}
