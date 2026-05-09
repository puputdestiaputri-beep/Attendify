require('dotenv').config();
const express = require('express');
const cors = require('cors');

const apiRoutes = require('./routes/api');

const app = express();

// Middleware
app.use(cors());
// Built-in middleware for json with extended body limit to handle base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Simple welcome route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Attendify Backend API' });
});

// Mount robust Express router
// This correctly mounts all routes defined in api.js under the '/api' prefix.
// The ESP32 route will become: /api/iot/recognize
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is gracefully running on port ${PORT}.`);
    console.log(`Local:   http://localhost:${PORT}/api/`);
    console.log(`Network: http://10.149.165.20:${PORT}/api/`);
    console.log(`ESP32:   http://10.149.165.20:${PORT}/api/iot/recognize`);
    console.log('JWT_SECRET loaded:', process.env.JWT_SECRET ? 'YES' : 'NO');
});
