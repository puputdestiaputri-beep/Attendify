require('dotenv').config();
const express = require('express');
const cors = require('cors');

const apiRoutes = require('./routes/api');

const app = express();

// Middleware
app.use(cors());
// Built-in middleware for json with extended body limit to handle base64 images
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple welcome route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Attendify Backend API' });
});

// Mount robust Express router
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is gracefully running on port ${PORT}.`);
    console.log(`Endpoints available under: http://localhost:${PORT}/api/`);
    console.log('JWT_SECRET loaded:', process.env.JWT_SECRET ? 'YES' : 'NO');
});
