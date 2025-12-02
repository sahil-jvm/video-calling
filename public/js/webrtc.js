// ---------------------------------------------
// WebRTC connection management
// ---------------------------------------------
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

// ---------------------------------------------
// Initialize Local Media
// ---------------------------------------------
async function initializeMedia() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }
        });

        localVideo.srcObject = localStream;

        // Initialize optional filters
        initializeFilters(localStream);

        console.log('Media initialized');
    } catch (error) {
        console.error('Error accessing media devices:', error);
        throw error;
    }
}

// ---------------------------------------------
// Stop Local Media
// ---------------------------------------------
function stopMedia() {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
    localVideo.srcObject = null;
    remoteVideo.srcObject = null;
}

// ---------------------------------------------
// Create Peer Connection
// ---------------------------------------------
function createPeerConnection() {
    peerConnection = new RTCPeerConnection(configuration);

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('ice-candidate', {
                candidate: event.candidate,
                to: partnerId
            });
        }
    };

    peerConnection.ontrack = (event) => {
        console.log('Received remote track');

        if (!remoteStream) {
            remoteStream = new MediaStream();
            remoteVideo.srcObject = remoteStream;
        }

        remoteStream.addTrack(event.track);
    };

    peerConnection.onconnectionstatechange = () => {
        console.log('Connection state:', peerConnection.connectionState);

        if (peerConnection.connectionState === 'connected') {
            updateStatus('Connected');
            showWaitingOverlay(false);
        } else if (
            peerConnection.connectionState === 'disconnected' ||
            peerConnection.connectionState === 'failed'
        ) {
            handlePartnerDisconnected();
        }
    };

    peerConnection.oniceconnectionstatechange = () => {
        console.log('ICE state:', peerConnection.iceConnectionState);
    };
}

// ---------------------------------------------
// Match Found → Create Offer (Initiator)
// ---------------------------------------------
async function handleMatchFound(partnerSocketId) {
    partnerId = partnerSocketId;

    createPeerConnection();

    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        socket.emit('offer', { offer, to: partnerId });

        console.log('Offer sent to', partnerId);

    } catch (error) {
        console.error('Error creating offer:', error);
    }
}

// ---------------------------------------------
// Handle Incoming Offer
// ---------------------------------------------
async function handleOffer(data) {
    partnerId = data.from;
    console.log('Received offer from', partnerId);

    if (peerConnection) {
        console.warn("PeerConnection already exists, closing old one.");
        closeConnection();
    }

    createPeerConnection();

    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    try {
        await peerConnection.setRemoteDescription(
            new RTCSessionDescription(data.offer)
        );

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        socket.emit('answer', { answer, to: partnerId });

        console.log('Answer sent to', partnerId);

    } catch (error) {
        console.error('Error handling offer:', error);
    }
}

// ---------------------------------------------
// Handle Incoming Answer (FIXED VERSION)
// ---------------------------------------------
async function handleAnswer(data) {
    console.log('Received answer from', data.from);

    if (!peerConnection) {
        console.warn('No peerConnection exists. Ignoring answer.');
        return;
    }

    console.log('Signaling state before answer:', peerConnection.signalingState);

    // Only accept answer when in correct state
    if (peerConnection.signalingState !== 'have-local-offer') {
        console.warn(
            'Ignoring answer because signalingState =',
            peerConnection.signalingState
        );
        return;
    }

    // Avoid duplicate remote descriptions
    if (peerConnection.remoteDescription && peerConnection.remoteDescription.type) {
        console.warn(
            'Remote description already set. Ignoring duplicate answer.'
        );
        return;
    }

    try {
        const remoteDesc = new RTCSessionDescription(data.answer);
        await peerConnection.setRemoteDescription(remoteDesc);

        console.log('Remote answer successfully applied.');

    } catch (error) {
        console.error('Error handling answer:', error);
    }
}

// ---------------------------------------------
// Handle Incoming ICE Candidate
// ---------------------------------------------
async function handleIceCandidate(data) {
    console.log('Received ICE candidate from', data.from);

    try {
        if (peerConnection) {
            await peerConnection.addIceCandidate(
                new RTCIceCandidate(data.candidate)
            );
        }
    } catch (error) {
        console.error('Error adding ICE candidate:', error);
    }
}

// ---------------------------------------------
// Close Peer Connection
// ---------------------------------------------
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
