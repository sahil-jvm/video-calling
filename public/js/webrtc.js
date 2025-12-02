// WebRTC connection management
let localStream;
let remoteStream;
let peerConnection;
let partnerId;

const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
    ]
};

const localVideo = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-video');

// Initialize media devices
async function initializeMedia() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }
        });

        localVideo.srcObject = localStream;

        // Initialize face filters with local stream
        initializeFilters(localStream);

        console.log('Media initialized');
    } catch (error) {
        console.error('Error accessing media devices:', error);
        throw error;
    }
}

// Stop media streams
function stopMedia() {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
    localVideo.srcObject = null;
    remoteVideo.srcObject = null;
}

// Handle match found - initiator creates offer
async function handleMatchFound(partnerSocketId) {
    partnerId = partnerSocketId;

    // Create peer connection
    createPeerConnection();

    // Add local stream to peer connection
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    // Create and send offer
    try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        socket.emit('offer', {
            offer: offer,
            to: partnerId
        });

        console.log('Offer sent to', partnerId);
    } catch (error) {
        console.error('Error creating offer:', error);
    }
}

// Create peer connection
function createPeerConnection() {
    peerConnection = new RTCPeerConnection(configuration);

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('ice-candidate', {
                candidate: event.candidate,
                to: partnerId
            });
        }
    };

    // Handle remote stream
    peerConnection.ontrack = (event) => {
        console.log('Received remote track');
        if (!remoteStream) {
            remoteStream = new MediaStream();
            remoteVideo.srcObject = remoteStream;
        }
        remoteStream.addTrack(event.track);
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
        console.log('Connection state:', peerConnection.connectionState);

        if (peerConnection.connectionState === 'connected') {
            updateStatus('Connected');
            showWaitingOverlay(false);
        } else if (peerConnection.connectionState === 'disconnected' ||
            peerConnection.connectionState === 'failed') {
            handlePartnerDisconnected();
        }
    };

    // Handle ICE connection state
    peerConnection.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', peerConnection.iceConnectionState);
    };
}

// Handle incoming offer
async function handleOffer(data) {
    partnerId = data.from;
    console.log('Received offer from', partnerId);

    // Create peer connection
    createPeerConnection();

    // Add local stream to peer connection
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    try {
        // Set remote description
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));

        // Create and send answer
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        socket.emit('answer', {
            answer: answer,
            to: partnerId
        });

        console.log('Answer sent to', partnerId);
    } catch (error) {
        console.error('Error handling offer:', error);
    }
}

// Handle incoming answer
async function handleAnswer(data) {
    console.log('Received answer from', data.from);

    try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
    } catch (error) {
        console.error('Error handling answer:', error);
    }
}

// Handle incoming ICE candidate
async function handleIceCandidate(data) {
    console.log('Received ICE candidate from', data.from);

    try {
        if (peerConnection) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
    } catch (error) {
        console.error('Error adding ICE candidate:', error);
    }
}

// Close peer connection
function closeConnection() {
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }

    if (remoteStream) {
        remoteStream.getTracks().forEach(track => track.stop());
        remoteStream = null;
    }

    remoteVideo.srcObject = null;
    partnerId = null;
}
