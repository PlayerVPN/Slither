const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let players = [];

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A player connected: ' + socket.id);

    socket.on('newPlayer', (data) => {
        const newPlayer = {
            id: socket.id,
            nickname: data.nickname,
            color: data.snakeColor,
            x: Math.random() * 500,
            y: Math.random() * 500,
            size: 10,
            body: [{ x: Math.random() * 500, y: Math.random() * 500 }],
        };
        players.push(newPlayer);
        io.emit('updatePlayer', newPlayer);
    });

    socket.on('disconnect', () => {
        players = players.filter(player => player.id !== socket.id);
        io.emit('updateLeaderboard', players);
    });

    socket.on('gameOver', () => {
        io.emit('gameOver');
    });
});

setInterval(() => {
    io.emit('updateLeaderboard', players);
}, 5000);

server.listen(3000, () => {
    console.log('Server running on port 3000');
});
