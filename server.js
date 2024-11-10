const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let players = {};
let food = [];

// Serve static files (for the frontend)
app.use(express.static('public'));

// Create random food on the map
function createFood() {
    const x = Math.random() * 800;
    const y = Math.random() * 600;
    food.push({ x, y });
}

createFood(); // Initial food spawn

// Handle new player connection
io.on('connection', (socket) => {
    console.log('A player connected: ' + socket.id);

    // Handle new player joining
    socket.on('newPlayer', (nickname) => {
        players[socket.id] = { x: 100, y: 100, size: 10, body: [{ x: 100, y: 100 }], id: socket.id, color: 'green', nickname };
    });

    // Handle player movement
    socket.on('move', (data) => {
        players[socket.id].x = data.x;
        players[socket.id].y = data.y;
        players[socket.id].body = data.body;
        players[socket.id].size = data.size;
        players[socket.id].color = data.color;
    });

    // Send game state to all clients every frame
    setInterval(() => {
        io.emit('gameState', players);
    }, 1000 / 60); // 60 FPS

    // Handle player disconnect
    socket.on('disconnect', () => {
        console.log('Player disconnected: ' + socket.id);
        delete players[socket.id];
    });
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
