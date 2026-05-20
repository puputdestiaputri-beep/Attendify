const tf = require('@tensorflow/tfjs');
const faceapi = require('face-api.js');
const canvas = require('canvas');
const path = require('path');

// Configure face-api to use nodejs canvas
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

let modelsLoaded = false;

// In-memory cache for face embeddings
// Format: { '1': [LabeledFaceDescriptors...], '2': [...] }
let embeddingCache = null;

// Normalization function (L2)
const normalizeL2 = (descriptor) => {
    let sum = 0;
    for (let i = 0; i < descriptor.length; i++) {
        sum += descriptor[i] * descriptor[i];
    }
    const norm = Math.sqrt(sum);
    if (norm === 0) return descriptor;
    const normalized = new Float32Array(descriptor.length);
    for (let i = 0; i < descriptor.length; i++) {
        normalized[i] = descriptor[i] / norm;
    }
    return normalized;
};

const init = async () => {
    if (modelsLoaded) return;
    const modelsPath = path.join(__dirname, '..', 'models');
    
    console.log('Loading Face API Models from:', modelsPath);
    await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromDisk(modelsPath),
        faceapi.nets.faceLandmark68Net.loadFromDisk(modelsPath),
        faceapi.nets.faceRecognitionNet.loadFromDisk(modelsPath)
    ]);
    modelsLoaded = true;
    console.log('Face API Models Loaded!');
};

/**
 * Validate image quality
 * @param {Buffer} imageBuffer 
 * @returns {Object} { isValid: boolean, error?: string, detection?: any }
 */
const validateImageQuality = async (imageBuffer) => {
    if (!modelsLoaded) await init();

    const img = new Canvas.Image();
    img.src = imageBuffer;

    // Detect multiple faces to ensure only one is present
    const detections = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();

    if (detections.length === 0) {
        return { isValid: false, error: 'No face detected. Please ensure the face is clearly visible.' };
    }

    if (detections.length > 1) {
        return { isValid: false, error: 'Multiple faces detected. Please ensure only one person is in the photo.' };
    }

    const detection = detections[0];
    
    // Check detection score (as a proxy for quality/clarity)
    if (detection.detection.score < 0.8) {
        return { isValid: false, error: 'Low quality image. Please provide a clearer photo.' };
    }

    // Check face size relative to image
    const faceBox = detection.detection.box;
    const imgWidth = img.width;
    const imgHeight = img.height;
    const faceArea = faceBox.width * faceBox.height;
    const imgArea = imgWidth * imgHeight;
    
    if (faceArea < imgArea * 0.05) {
        return { isValid: false, error: 'Face is too small. Please move closer to the camera.' };
    }

    // Optional: add brightness/contrast check here if needed
    // However, faceapi detection score already acts as a robust proxy for lighting/blur

    return { isValid: true, detection };
};

/**
 * Extract face descriptor from an image buffer with quality check
 * @param {Buffer} imageBuffer 
 * @returns {Float32Array|null} descriptor
 */
const encodeFace = async (imageBuffer) => {
    const quality = await validateImageQuality(imageBuffer);
    if (!quality.isValid) return null;
    return normalizeL2(quality.detection.descriptor);
};

/**
 * Calculate the average embedding from multiple descriptors
 * @param {Array<Float32Array>} descriptors 
 * @returns {Float32Array}
 */
const calculateAverageEmbedding = (descriptors) => {
    if (!descriptors || descriptors.length === 0) return null;
    
    const size = descriptors[0].length;
    const avg = new Float32Array(size).fill(0);
    
    for (const desc of descriptors) {
        for (let i = 0; i < size; i++) {
            avg[i] += desc[i];
        }
    }
    
    for (let i = 0; i < size; i++) {
        avg[i] /= descriptors.length;
    }
    
    return normalizeL2(avg);
};

/**
 * Compare an incoming face against registered faces
 * @param {Buffer} imageBuffer 
 * @param {Array} registeredProfiles Array of { user_id, embedding_data (JSON string) }
 * @returns {Object} matchResult
 */
const recognizeFace = async (imageBuffer, registeredProfiles) => {
    if (!modelsLoaded) await init();

    const img = new Canvas.Image();
    img.src = imageBuffer;

    const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
    if (!detection) return { success: false, message: 'No face detected in the image' };

    // Detect multiple faces for spoofing check
    const allFaces = await faceapi.detectAllFaces(img);
    if (allFaces.length > 1) {
        return { success: false, message: 'Multiple faces detected', spoof: true, type: 'MULTIPLE_FACES' };
    }

    if (registeredProfiles.length === 0) {
        return { success: false, message: 'No registered face profiles found' };
    }

    // Load into cache if empty or if profiles count changed
    // In a real production system, you'd invalidate cache dynamically on new registrations
    if (!embeddingCache || embeddingCache.length !== registeredProfiles.length) {
        console.log('[FaceService] Rebuilding embedding cache...');
        embeddingCache = registeredProfiles.map(profile => {
            try {
                const descriptorArray = JSON.parse(profile.embedding_data);
                return new faceapi.LabeledFaceDescriptors(
                    profile.user_id.toString(),
                    [normalizeL2(new Float32Array(descriptorArray))]
                );
            } catch (e) {
                console.error(`Error parsing embedding for user ${profile.user_id}:`, e);
                return null;
            }
        }).filter(ld => ld !== null);
    }

    if (embeddingCache.length === 0) {
        return { success: false, message: 'Invalid face profile data' };
    }

    const normalizedQuery = normalizeL2(detection.descriptor);
    const faceMatcher = new faceapi.FaceMatcher(embeddingCache, 0.5); // Stricter threshold since vectors are normalized
    const bestMatch = faceMatcher.findBestMatch(normalizedQuery);

    if (bestMatch.label === 'unknown') {
        return { success: false, message: 'Face not recognized', confidence: 1 - bestMatch.distance, spoof: true, type: 'UNKNOWN_FACE' };
    }

    return {
        success: true,
        user_id: parseInt(bestMatch.label),
        distance: bestMatch.distance,
        confidence: 1 - bestMatch.distance
    };
};

const clearCache = () => {
    embeddingCache = null;
    console.log('[FaceService] Cache invalidated');
};

module.exports = {
    init,
    encodeFace,
    validateImageQuality,
    calculateAverageEmbedding,
    recognizeFace,
    clearCache
};
