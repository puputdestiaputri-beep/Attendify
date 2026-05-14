const tf = require('@tensorflow/tfjs-node');
const faceapi = require('face-api.js');
const canvas = require('canvas');
const path = require('path');

// Configure face-api to use nodejs canvas
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

let modelsLoaded = false;

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
 * Extract face descriptor from an image buffer
 * @param {Buffer} imageBuffer 
 * @returns {Float32Array|null} descriptor
 */
const encodeFace = async (imageBuffer) => {
    if (!modelsLoaded) await init();

    const img = new Canvas.Image();
    img.src = imageBuffer;

    const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
    if (!detection) return null;

    return detection.descriptor;
};

/**
 * Compare an incoming face against registered faces
 * @param {Buffer} imageBuffer 
 * @param {Array} registeredUsers Array of { user_id, descriptor (Float32Array) }
 * @returns {Object|null} matchedUser { user_id, distance } or null if no match
 */
const recognizeFace = async (imageBuffer, registeredUsers) => {
    if (!modelsLoaded) await init();

    const img = new Canvas.Image();
    img.src = imageBuffer;

    const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
    if (!detection) return { success: false, message: 'No face detected in the image' };

    if (registeredUsers.length === 0) {
        return { success: false, message: 'No users registered for face recognition' };
    }

    // Convert registered users into LabeledFaceDescriptors
    const labeledDescriptors = registeredUsers.map(user => {
        return new faceapi.LabeledFaceDescriptors(
            user.user_id.toString(),
            [new Float32Array(Object.values(JSON.parse(user.face_descriptor)))]
        );
    });

    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
    const bestMatch = faceMatcher.findBestMatch(detection.descriptor);

    if (bestMatch.label === 'unknown') {
        return { success: false, message: 'Face not recognized' };
    }

    return {
        success: true,
        user_id: parseInt(bestMatch.label),
        distance: bestMatch.distance
    };
};

module.exports = {
    init,
    encodeFace,
    recognizeFace
};
