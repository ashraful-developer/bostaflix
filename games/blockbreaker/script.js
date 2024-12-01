// script.js
const game = document.getElementById("game");
const paddle = document.getElementById("paddle");
const ball = document.getElementById("ball");

let ballSpeedX = 3;
let ballSpeedY = 3;
let ballX = 190;
let ballY = 300;

let paddleX = 150;
const paddleSpeed = 5;

const blocks = [];

// Create blocks
function createBlocks() {
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 8; j++) {
      const block = document.createElement("div");
      block.classList.add("block");
      block.style.left = `${j * 50}px`;
      block.style.top = `${i * 20}px`;
      game.appendChild(block);
      blocks.push(block);
    }
  }
}

// Initialize blocks
createBlocks();

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" && paddleX > 0) {
    paddleX -= paddleSpeed;
  } else if (e.key === "ArrowRight" && paddleX < 300) {
    paddleX += paddleSpeed;
  }
  paddle.style.left = `${paddleX}px`;
});

function gameLoop() {
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  // Ball collision with walls
  if (ballX <= 0 || ballX >= 380) ballSpeedX *= -1;
  if (ballY <= 0) ballSpeedY *= -1;

  // Ball collision with paddle
  if (
    ballY >= 560 &&
    ballX + 20 >= paddleX &&
    ballX <= paddleX + 100
  ) {
    ballSpeedY *= -1;
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
      block.remove();
      blocks.splice(index, 1);
    }
  });

  // Game over
  if (ballY > 600) {
    alert("Game Over!");
    document.location.reload();
  }

  ball.style.left = `${ballX}px`;
  ball.style.top = `${ballY}px`;

  requestAnimationFrame(gameLoop);
}

gameLoop();
