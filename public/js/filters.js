// Advanced Face Filters with Canvas-based Transformation
let model;
let filterCanvas;
let filterContext;
let currentFilter = 'none';
let animationFrameId;
let isFilterActive = false;
let videoElement;
let canvasElement;

// Initialize filters
async function initializeFilters(stream) {
    console.log('Initializing advanced face filters...');

    filterCanvas = document.getElementById('filter-canvas');
    filterContext = filterCanvas.getContext('2d', { willReadFrequently: true });
    videoElement = document.getElementById('local-video');
    canvasElement = filterCanvas;

    // Setup filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            // Set current filter
            const newFilter = btn.dataset.filter;
            console.log('Filter changed to:', newFilter);

            // Stop previous filter if running
            if (isFilterActive) {
                stopFilterRendering();
            }

            currentFilter = newFilter;
            applyFilter();
        });
    });

    // Try to load TensorFlow.js for face detection
    try {
        await tf.ready();
        console.log('TensorFlow.js ready');

        // Load face detection model
        model = await faceLandmarksDetection.load(
            faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
            { maxFaces: 1 }
        );
        console.log('Face detection model loaded successfully!');
    } catch (error) {
        console.log('Face detection model not available, using enhanced CSS filters:', error);
    }
}

// Apply filter to video
function applyFilter() {
    // For child and girl filters, use canvas-based transformation
    if (currentFilter === 'child' || currentFilter === 'girl') {
        startCanvasFilter();
    } else {
        // For other filters, use CSS
        stopFilterRendering();
        applyCSSFilter();
    }
}

// Apply CSS-based filters
function applyCSSFilter() {
    const video = document.getElementById('local-video');

    // Hide canvas, show video
    canvasElement.style.display = 'none';
    video.style.display = 'block';

    // Reset all filters
    video.style.filter = '';

    // Apply selected filter
    switch (currentFilter) {
        case 'none':
            video.style.filter = '';
            break;

        case 'blur':
            video.style.filter = 'blur(3px)';
            break;

        case 'vintage':
            video.style.filter = 'sepia(60%) contrast(1.2) brightness(0.9)';
            break;

        case 'cool':
            video.style.filter = 'hue-rotate(180deg) saturate(1.5)';
            break;

        default:
            video.style.filter = '';
    }
}

// Start canvas-based filter rendering
function startCanvasFilter() {
    const video = document.getElementById('local-video');

    // Show canvas, hide video (we'll draw to canvas)
    canvasElement.style.display = 'block';
    canvasElement.className = 'local-video'; // Apply same styling
    video.style.display = 'none';

    isFilterActive = true;
    renderCanvasFilter();
}

// Render canvas-based filters
async function renderCanvasFilter() {
    if (!isFilterActive || (currentFilter !== 'child' && currentFilter !== 'girl')) {
        return;
    }

    const video = document.getElementById('local-video');

    // Set canvas size to match video
    if (filterCanvas.width !== video.videoWidth || filterCanvas.height !== video.videoHeight) {
        filterCanvas.width = video.videoWidth;
        filterCanvas.height = video.videoHeight;
    }

    // Draw video frame to canvas
    filterContext.drawImage(video, 0, 0, filterCanvas.width, filterCanvas.height);

    // Get image data for manipulation
    const imageData = filterContext.getImageData(0, 0, filterCanvas.width, filterCanvas.height);

    try {
        // Try to detect face for better transformation
        if (model) {
            const predictions = await model.estimateFaces({
                input: video,
                returnTensors: false,
                flipHorizontal: false,
                predictIrises: false
            });

            if (predictions.length > 0) {
                const face = predictions[0];

                // Apply face-aware transformation
                if (currentFilter === 'child') {
                    applyChildFaceTransform(imageData, face);
                } else if (currentFilter === 'girl') {
                    applyGirlFaceTransform(imageData, face);
                }
            } else {
                // No face detected, apply general transformation
                if (currentFilter === 'child') {
                    applyChildFaceTransformGeneral(imageData);
                } else if (currentFilter === 'girl') {
                    applyGirlFaceTransformGeneral(imageData);
                }
            }
        } else {
            // No model loaded, apply general transformation
            if (currentFilter === 'child') {
                applyChildFaceTransformGeneral(imageData);
            } else if (currentFilter === 'girl') {
                applyGirlFaceTransformGeneral(imageData);
            }
        }
    } catch (error) {
        console.error('Error in face transformation:', error);
        // Fallback to general transformation
        if (currentFilter === 'child') {
            applyChildFaceTransformGeneral(imageData);
        } else if (currentFilter === 'girl') {
            applyGirlFaceTransformGeneral(imageData);
        }
    }

    // Put modified image data back
    filterContext.putImageData(imageData, 0, 0);

    // Continue animation loop
    animationFrameId = requestAnimationFrame(renderCanvasFilter);
}

// Apply child face transformation with face detection
function applyChildFaceTransform(imageData, face) {
    const data = imageData.data;
    const boundingBox = face.boundingBox;

    // Get face region
    const faceX = Math.max(0, Math.floor(boundingBox.topLeft[0]));
    const faceY = Math.max(0, Math.floor(boundingBox.topLeft[1]));
    const faceWidth = Math.min(imageData.width - faceX, Math.floor(boundingBox.bottomRight[0] - boundingBox.topLeft[0]));
    const faceHeight = Math.min(imageData.height - faceY, Math.floor(boundingBox.bottomRight[1] - boundingBox.topLeft[1]));

    // Apply child-like features: bigger eyes effect, smoother skin, rosy cheeks
    for (let y = faceY; y < faceY + faceHeight; y++) {
        for (let x = faceX; x < faceX + faceWidth; x++) {
            const idx = (y * imageData.width + x) * 4;

            // Smooth skin (reduce texture)
            const smoothFactor = 0.85;
            data[idx] = data[idx] * smoothFactor + 255 * (1 - smoothFactor) * 0.3; // R
            data[idx + 1] = data[idx + 1] * smoothFactor + 255 * (1 - smoothFactor) * 0.25; // G
            data[idx + 2] = data[idx + 2] * smoothFactor + 255 * (1 - smoothFactor) * 0.2; // B

            // Brighten (children have brighter skin)
            data[idx] = Math.min(255, data[idx] * 1.15);
            data[idx + 1] = Math.min(255, data[idx + 1] * 1.12);
            data[idx + 2] = Math.min(255, data[idx + 2] * 1.1);

            // Add rosy cheeks effect (more red in cheek area)
            const cheekY = faceY + faceHeight * 0.5;
            const distFromCheek = Math.abs(y - cheekY);
            if (distFromCheek < faceHeight * 0.2) {
                const rosyFactor = (1 - distFromCheek / (faceHeight * 0.2)) * 0.2;
                data[idx] = Math.min(255, data[idx] + 30 * rosyFactor); // More red
                data[idx + 1] = Math.min(255, data[idx + 1] + 10 * rosyFactor);
            }
        }
    }

    // Apply slight blur for softer appearance
    applyBoxBlur(imageData, faceX, faceY, faceWidth, faceHeight, 1);
}

// Apply girl face transformation with face detection
function applyGirlFaceTransform(imageData, face) {
    const data = imageData.data;
    const boundingBox = face.boundingBox;

    // Get face region
    const faceX = Math.max(0, Math.floor(boundingBox.topLeft[0]));
    const faceY = Math.max(0, Math.floor(boundingBox.topLeft[1]));
    const faceWidth = Math.min(imageData.width - faceX, Math.floor(boundingBox.bottomRight[0] - boundingBox.topLeft[0]));
    const faceHeight = Math.min(imageData.height - faceY, Math.floor(boundingBox.bottomRight[1] - boundingBox.topLeft[1]));

    // Apply feminine features: smoother skin, warmer tones, enhanced features
    for (let y = faceY; y < faceY + faceHeight; y++) {
        for (let x = faceX; x < faceX + faceWidth; x++) {
            const idx = (y * imageData.width + x) * 4;

            // Smooth and brighten skin
            const smoothFactor = 0.9;
            data[idx] = data[idx] * smoothFactor + 255 * (1 - smoothFactor) * 0.35; // R
            data[idx + 1] = data[idx + 1] * smoothFactor + 255 * (1 - smoothFactor) * 0.28; // G
            data[idx + 2] = data[idx + 2] * smoothFactor + 255 * (1 - smoothFactor) * 0.25; // B

            // Add warmth (more red/pink tones)
            data[idx] = Math.min(255, data[idx] * 1.12);
            data[idx + 1] = Math.min(255, data[idx + 1] * 1.05);
            data[idx + 2] = Math.min(255, data[idx + 2] * 0.98);

            // Enhance lips area (lower third of face)
            const lipY = faceY + faceHeight * 0.7;
            if (y > lipY && y < faceY + faceHeight) {
                const lipFactor = 0.15;
                data[idx] = Math.min(255, data[idx] + 25 * lipFactor); // Redder lips
                data[idx + 1] = Math.max(0, data[idx + 1] - 10 * lipFactor);
            }

            // Enhance cheeks
            const cheekY = faceY + faceHeight * 0.5;
            const distFromCheek = Math.abs(y - cheekY);
            if (distFromCheek < faceHeight * 0.25) {
                const blushFactor = (1 - distFromCheek / (faceHeight * 0.25)) * 0.15;
                data[idx] = Math.min(255, data[idx] + 20 * blushFactor);
                data[idx + 1] = Math.min(255, data[idx + 1] + 8 * blushFactor);
            }
        }
    }

    // Apply slight blur for smoother skin
    applyBoxBlur(imageData, faceX, faceY, faceWidth, faceHeight, 0.8);
}

// Apply child face transformation without face detection (general)
function applyChildFaceTransformGeneral(imageData) {
    const data = imageData.data;

    // Apply to entire image
    for (let i = 0; i < data.length; i += 4) {
        // Smooth and brighten
        const smoothFactor = 0.9;
        data[i] = data[i] * smoothFactor + 255 * (1 - smoothFactor) * 0.3;
        data[i + 1] = data[i + 1] * smoothFactor + 255 * (1 - smoothFactor) * 0.25;
        data[i + 2] = data[i + 2] * smoothFactor + 255 * (1 - smoothFactor) * 0.2;

        // Brighten
        data[i] = Math.min(255, data[i] * 1.15);
        data[i + 1] = Math.min(255, data[i + 1] * 1.12);
        data[i + 2] = Math.min(255, data[i + 2] * 1.1);

        // Increase saturation slightly
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = Math.min(255, avg + (data[i] - avg) * 1.2);
        data[i + 1] = Math.min(255, avg + (data[i + 1] - avg) * 1.2);
        data[i + 2] = Math.min(255, avg + (data[i + 2] - avg) * 1.2);
    }
}

// Apply girl face transformation without face detection (general)
function applyGirlFaceTransformGeneral(imageData) {
    const data = imageData.data;

    // Apply to entire image
    for (let i = 0; i < data.length; i += 4) {
        // Smooth and add warmth
        const smoothFactor = 0.92;
        data[i] = data[i] * smoothFactor + 255 * (1 - smoothFactor) * 0.35;
        data[i + 1] = data[i + 1] * smoothFactor + 255 * (1 - smoothFactor) * 0.28;
        data[i + 2] = data[i + 2] * smoothFactor + 255 * (1 - smoothFactor) * 0.25;

        // Add warmth
        data[i] = Math.min(255, data[i] * 1.12);
        data[i + 1] = Math.min(255, data[i + 1] * 1.05);
        data[i + 2] = Math.min(255, data[i + 2] * 0.98);

        // Increase saturation
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = Math.min(255, avg + (data[i] - avg) * 1.25);
        data[i + 1] = Math.min(255, avg + (data[i + 1] - avg) * 1.25);
        data[i + 2] = Math.min(255, avg + (data[i + 2] - avg) * 1.25);
    }
}

// Simple box blur for smoothing
function applyBoxBlur(imageData, x, y, width, height, radius) {
    // Simple blur implementation for face region
    const data = imageData.data;
    const tempData = new Uint8ClampedArray(data);

    for (let py = y; py < y + height; py++) {
        for (let px = x; px < x + width; px++) {
            let r = 0, g = 0, b = 0, count = 0;

            // Sample surrounding pixels
            for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {
                    const nx = px + dx;
                    const ny = py + dy;

                    if (nx >= x && nx < x + width && ny >= y && ny < y + height) {
                        const idx = (ny * imageData.width + nx) * 4;
                        r += tempData[idx];
                        g += tempData[idx + 1];
                        b += tempData[idx + 2];
                        count++;
                    }
                }
            }

            const idx = (py * imageData.width + px) * 4;
            data[idx] = r / count;
            data[idx + 1] = g / count;
            data[idx + 2] = b / count;
        }
    }
}

// Stop filter rendering
function stopFilterRendering() {
    isFilterActive = false;

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    // Reset video display
    const video = document.getElementById('local-video');
    canvasElement.style.display = 'none';
    video.style.display = 'block';
    video.style.filter = '';
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    stopFilterRendering();
});
