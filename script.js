const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const moveButton = document.getElementById('moveButton');
const stopButton = document.getElementById('stopButton');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const gameOverMessage = document.createElement('div'); // Create a game over message element
const tryAgainButton = document.createElement('button'); // Create a try again button

canvas.width = 400;
canvas.height = 500;

const ringImage = new Image();
ringImage.src = 'images/ring.png';

const targetImage = new Image();
targetImage.src = 'images/target.png';

const rings = [];
const ringCount = 10;
const target = { x: canvas.width / 2, y: 50, radius: 30 };
let score = 0;
let highScore = parseInt(localStorage.getItem('highScore')) || 0; // Ensure it's an integer
let isGameRunning = false;

highScoreDisplay.textContent = `High Score: ${highScore}`; // Set it correctly here

for (let i = 0; i < ringCount; i++) {
    rings.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 15,
        dx: Math.random() * 2 - 1, // Reduced speed
        dy: Math.random() * 2 - 1  // Reduced speed
    });
}

// Ensure the initial score is displayed as zero
scoreDisplay.textContent = `Score: ${score}`;

function drawRing(ring) {
    ctx.drawImage(ringImage, ring.x - ring.radius, ring.y - ring.radius, ring.radius * 2, ring.radius * 2);
}

function drawTarget() {
    ctx.drawImage(targetImage, target.x - target.radius, target.y - target.radius, target.radius * 2, target.radius * 2);
}

function updateRings() {
    for (let ring of rings) {
        ring.x += ring.dx;
        ring.y += ring.dy;

        if (ring.x + ring.radius > canvas.width || ring.x - ring.radius < 0) {
            ring.dx *= -1;
            score -= 50; // Penalty for hitting walls
        }
        if (ring.y + ring.radius > canvas.height || ring.y - ring.radius < 0) {
            ring.dy *= -1;
            score -= 50; // Penalty for hitting walls
        }
    }
}

function checkForScore() {
    let allRingsCollected = true; // Flag to check if all rings are collected

    for (let ring of rings) {
        const dist = Math.hypot(ring.x - target.x, ring.y - target.y);
        if (dist < target.radius) {
            ring.x = target.x;
            ring.y = target.y;
            ring.dx = 0;
            ring.dy = 0;
            score += 100; // Score increment for landing in the target
            scoreDisplay.textContent = `Score: ${score}`;
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('highScore', highScore);
                highScoreDisplay.textContent = `High Score: ${highScore}`; // Set it only when high score is updated
            }
        } else {
            allRingsCollected = false; // If any ring is not collected, set the flag to false
        }
    }

    // If all rings are collected, stop the game
    if (allRingsCollected) {
        setTimeout(() => {
            gameOver(true); // Pass true to indicate a successful end
        }, 500); // Delay before calling gameOver
    }
}

function checkCollisions() {
    for (let i = 0; i < rings.length; i++) {
        for (let j = i + 1; j < rings.length; j++) {
            const ring1 = rings[i];
            const ring2 = rings[j];
            const dist = Math.hypot(ring1.x - ring2.x, ring1.y - ring2.y);

            if (dist < ring1.radius + ring2.radius) {
                ring1.dx *= -1;
                ring1.dy *= -1;
                ring2.dx *= -1;
                ring2.dy *= -1;

                // Random direction change
                ring1.dx += Math.random() * 0.5 - 0.25; // Reduced random change
                ring1.dy += Math.random() * 0.5 - 0.25; // Reduced random change
                ring2.dx += Math.random() * 0.5 - 0.25; // Reduced random change
                ring2.dy += Math.random() * 0.5 - 0.25; // Reduced random change
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawTarget();
    for (let ring of rings) {
        drawRing(ring);
    }

    // Update score display here
    scoreDisplay.textContent = `Score: ${score}`;

    // Check for game over condition
    if (score < -10000) { // Updated to check for -10000
        gameOver(false); // Pass false to indicate a loss
    }
}

function gameOver(success) {
    isGameRunning = false; // Stop the game loop

    // Display game over message
    gameOverMessage.textContent = success ? "You Collected All Rings!" : "You Lose!";
    gameOverMessage.style.fontSize = "30px";
    gameOverMessage.style.color = success ? "green" : "red";
    gameOverMessage.style.textAlign = "center";
    gameOverMessage.style.marginTop = "20px";
    document.body.appendChild(gameOverMessage);

    // Create and display the try again button
    tryAgainButton.textContent = "Try Again";
    tryAgainButton.style.fontSize = "20px";
    tryAgainButton.style.padding = "10px 20px";
    tryAgainButton.onclick = resetGame;
    document.body.appendChild(tryAgainButton);
}

function resetGame() {
    // Reset game variables
    score = 0;
    isGameRunning = false;
    rings.length = 0; // Clear the rings array

    for (let i = 0; i < ringCount; i++) {
        rings.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: 15,
            dx: Math.random() * 2 - 1, // Reduced speed
            dy: Math.random() * 2 - 1  // Reduced speed
        });
    }

    // Clear game over message and button
    gameOverMessage.textContent = "";
    document.body.removeChild(tryAgainButton);
    scoreDisplay.textContent = `Score: ${score}`;
    highScoreDisplay.textContent = `High Score: ${highScore}`;

    // Restart the game
    gameLoop();
}

function gameLoop() {
    if (isGameRunning) {
        updateRings();
        checkForScore();
        checkCollisions();
        draw();
        requestAnimationFrame(gameLoop);
    }
}

moveButton.addEventListener('click', () => {
    isGameRunning = true;
    for (let ring of rings) {
        ring.dx = Math.random() * 2 - 1; // Maintain same speed
        ring.dy = Math.random() * 2 - 1; // Maintain same speed
    }
    gameLoop();
});

stopButton.addEventListener('click', () => {
    isGameRunning = false;
});

ringImage.onload = () => {
    draw();
};
