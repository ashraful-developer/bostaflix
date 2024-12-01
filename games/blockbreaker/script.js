// script.js
const game = document.getElementById("game");
const paddle = document.getElementById("paddle");
const ball = document.getElementById("ball");
const scoreDisplay = document.getElementById("score");
const startButton = document.getElementById("start");
const pauseButton = document.getElementById("pause");
const playAgainButton = document.getElementById("play-again");

let ballSpeedX = 3;
let ballSpeedY = 3;
let ballX = 190;
let ballY = 300;

let paddleX = 150;
const paddleSpeed = 15; // Increased speed

let gameInterval;
let isPaused = false;
let score = 0;
let blocks = [];
let level = 1;

// Define block difficulties
const blockDifficulty = {
  easy: { color: "hsl(120, 70%, 50%)", hits: 1, size: 48 },
  medium: { color: "hsl(30, 70%, 50%)", hits: 2, size: 50 },
  hard: { color: "hsl(0, 70%, 50%)", hits: 3, size: 52 }
};

// Create blocks with difficulty
function createBlocks() {
  blocks.forEach(block => block.remove()); // Clear previous blocks
  blocks.length = 0; // Reset the blocks array
  let blockCount = level * 5; // Increase number of blocks with difficulty
  for (let i = 0; i < blockCount; i++) {
    let blockType = blockDifficulty.easy; // Default easy
    if (i % 3 === 0) blockType = blockDifficulty.medium; // Medium for some
    else if (i % 3 === 1) blockType = blockDifficulty.hard; // Hard for others

    const block = document.createElement("div");
    block.classList.add("block");
    block.style.left = `${(i % 8) * blockType.size}px`;
    block.style.top = `${Math.floor(i / 8) * 20}px`;
    block.style.width = `${blockType.size}px`;
    block.style.height = "18px";
    block.style.background = blockType.color;
    block.dataset.hits = blockType.hits; // Store how many hits the block needs
    game.appendChild(block);
    blocks.push(block);
  }
}

// Update score
function updateScore(points) {
  score += points;
  scoreDisplay.textContent = `Score: ${score}`;
}

// Handle paddle movement via keyboard (no delay in holding)
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" && paddleX > 0) {
    paddleX -= paddleSpeed;
  } else if (e.key === "ArrowRight" && paddleX < 300) {
    paddleX += paddleSpeed;
  }
  paddle.style.left = `${paddleX}px`;
});

// Handle paddle movement via touch/mouse
game.addEventListener("mousemove", (e) => {
  const rect = game.getBoundingClientRect();
  paddleX = Math.min(Math.max(e.clientX - rect.left - paddle.offsetWidth / 2, 0), 300);
  paddle.style.left = `${paddleX}px`;
});

// Add mobile touch controls
const leftButton = document.getElementById("left");
const rightButton = document.getElementById("right");

leftButton.addEventListener("touchstart", () => {
  if (paddleX > 0) {
    paddleX -= paddleSpeed;
    paddle.style.left = `${paddleX}px`;
  }
});

rightButton.addEventListener("touchstart", () => {
  if (paddleX < 300) {
    paddleX += paddleSpeed;
    paddle.style.left = `${paddleX}px`;
  }
});

// Handle game loop
function gameLoop() {
  if (isPaused) return;

  ballX += ballSpeedX;
  ballY += ballSpeedY;

  // Ball collision with walls
  if (ballX <= 0 || ballX >= 380) ballSpeedX *= -1;
  if (ballY <= 0) ballSpeedY *= -1;

  // Ball collision with paddle (improved)
  if (
    ballY + 20 >= 560 &&
    ballX + 20 >= paddleX &&
    ballX <= paddleX + 100
  ) {
    ballSpeedY *= -1;
    let collisionPoint = (ballX - (paddleX + 50)) / 50; // Calculate collision point on paddle
    ballSpeedX = collisionPoint * 5; // Make ball's horizontal speed based on where it hits the paddle
  }

  // Ball collision with blocks
  blocks.forEach((block, index) => {
    const rect = block.getBoundingClientRect();
    const ballRect = ball.getBoundingClientRect();
    if (
      ballRect.left < rect.right &&
      ballRect.right > rect.left &&
      ballRect.top < rect.bottom &&
      ballRect.bottom > rect.top
    ) {
      ballSpeedY *= -1;
      block.dataset.hits -= 1; // Decrease block's remaining hits

      // Remove block if all hits are used up
      if (block.dataset.hits == 0) {
        block.remove();
        blocks.splice(index, 1);
        updateScore(10); // Add score for each block cleared
      }
    }
  });

  // Game over
  if (ballY > 600) {
    alert("Game Over!");
    pauseGame();
    playAgainButton.style.display = "inline";
  }

  ball.style.left = `${ballX}px`;
  ball.style.top = `${ballY}px`;

  // Level up when all blocks are cleared
  if (blocks.length === 0) {
    level++;
    createBlocks(); // Regenerate blocks when all are cleared
  }
}

function startGame() {
  if (!gameInterval) {
    gameInterval = setInterval(gameLoop, 16); // ~60 FPS
  }
  isPaused = false;
}

function pauseGame() {
  isPaused = true;
  clearInterval(gameInterval);
  gameInterval = null;
}

function resetGame() {
  ballX = 190;
  ballY = 300;
  paddleX = 150;
  ballSpeedX = 3;
  ballSpeedY = 3;
  score = 0;
  level = 1;
  paddle.style.left = `${paddleX}px`;
  ball.style.left = `${ballX}px`;
  ball.style.top = `${ballY}px`;
  createBlocks();
  playAgainButton.style.display = "none";
  updateScore(0);
  startGame();
}

// Event listeners
startButton.addEventListener("click", startGame);
pauseButton.addEventListener("click", pauseGame);
playAgainButton.addEventListener("click", resetGame);

// Initialize the game
createBlocks();
