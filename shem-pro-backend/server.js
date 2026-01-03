require('dotenv').config();
const express = require('express');
const http = require('http'); // Import http
const { Server } = require('socket.io'); // Import socket.io
const cors = require('cors'); // Import cors

const app = express();
const server = http.createServer(app); // Create HTTP server

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for dev, restrict in prod
        methods: ["GET", "POST"]
    }
});

// Init Middleware
app.use(express.json({ extended: false }));
app.use(cors()); // Use cors middleware

app.get('/', (req, res) => res.send('SHEM Backend Live'));

// Define Routes
// Pass io to energy route
app.use('/api/energy', require('./routes/energy')(io));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/esp32data', require('./routes/esp32data'));
app.use('/api/data', require('./routes/data'));
app.use('/api/anomaly', require('./routes/anomaly'));
app.use('/api/forecast', require('./routes/forecast'));
app.use('/api/peak-hours', require('./routes/peakHours'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/appliance', require('./routes/appliance'));

const PORT = process.env.PORT || 5000;

if (require.main === module) {
    server.listen(PORT, () => console.log(`Server started on port ${PORT}`)); // Listen on server instead of app
}

module.exports = app;