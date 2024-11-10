let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');

let socket = io();
let nickname = '';
let snakeColor = '#ff3333';
let player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 10,
    body: [],
    dx: 1,
    dy: 0,
};

let powerUps = [];
let powerUpDuration = 5000;
let isInvincible = false;
let speedBoost = false;
let leaderboard = [];
let gameLoop;
let keys = {};

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function setSnakeColor(color) {
    snakeColor = color;
}

function startGame() {
    nickname = document.getElementById('nicknameInput').value;
    if (!nickname) {
        alert('Please enter a nickname');
        return;
    }
    socket.emit('joinPublicGame', { nickname, snakeColor });
    document.querySelector('.container').style.display = 'none';
    canvas.style.display = 'block';
    gameLoop = setInterval(updateGame, 1000 / 60);
}

function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    movePlayer();
    drawSnake();
    checkCollisions();
    checkPowerUpCollision();
    spawnFood();
    updateLeaderboard();
}

function movePlayer() {
    if (keys['ArrowUp']) player.y -= 5;
    if (keys['ArrowDown']) player.y += 5;
    if (keys['ArrowLeft']) player.x -= 5;
    if (keys['ArrowRight']) player.x += 5;

    player.body.unshift({ x: player.x, y: player.y });
    if (player.body.length > player.size) player.body.pop();
}

function drawSnake() {
    for (let i = 0; i < player.body.length; i++) {
        ctx.fillStyle = snakeColor;
        ctx.fillRect(player.body[i].x, player.body[i].y, 10, 10);
    }
}

function checkCollisions() {
    if (player.x < 0 || player.x > canvas.width || player.y < 0 || player.y > canvas.height) {
        gameOver();
    }
    for (let i = 1; i < player.body.length; i++) {
        if (player.body[i].x === player.x && player.body[i].y === player.y) {
            gameOver();
        }
    }
}

function spawnFood() {}

function checkPowerUpCollision() {}

function gameOver() {
    clearInterval(gameLoop);
    document.body.innerHTML = `<div class="game-over"><h1>Game Over</h1><button onclick="restartGame()">Restart</button></div>`;
}

function restartGame() {
    location.reload();
}

function updateLeaderboard() {
    socket.on('updateLeaderboard', (players) => {
        leaderboard = players;
        const leaderboardDisplay = document.getElementById('leaderboard-list');
        leaderboardDisplay.innerHTML = leaderboard.map(player => `<li>${player.nickname}: ${player.size}</li>`).join('');
    });
}

document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

socket.on('updatePlayer', (newPlayerData) => player = newPlayerData);
socket.on('gameOver', () => gameOver());
