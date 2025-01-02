// Game Constants
const gameContainer = document.getElementById('game-container');
const birdElement = document.createElement('div');
const ground = document.getElementById('ground');
let birdY = 200;
let birdVelocity = 0;
let gravity = 0.5;
let gameRunning = true;
let score = 0;

// Create Bird
gameContainer.appendChild(birdElement);
birdElement.className = 'bird';
birdElement.style.top = `${birdY}px`;
birdElement.style.left = '100px';

// Create Pipes
function createPipe() {
  const pipeTop = document.createElement('div');
  const pipeBottom = document.createElement('div');
  const pipeGap = 150;
  const pipeHeight = Math.random() * (window.innerHeight - pipeGap - 200) + 50;

  pipeTop.className = 'pipe pipe-top';
  pipeBottom.className = 'pipe pipe-bottom';

  pipeTop.style.height = `${pipeHeight}px`;
  pipeTop.style.right = '-60px';

  pipeBottom.style.height = `${window.innerHeight - pipeHeight - pipeGap}px`;
  pipeBottom.style.right = '-60px';

  gameContainer.appendChild(pipeTop);
  gameContainer.appendChild(pipeBottom);

  // Move pipes
  let pipePosition = window.innerWidth;
  const pipeInterval = setInterval(() => {
    if (!gameRunning) {
      clearInterval(pipeInterval);
      return;
    }

    pipePosition -= 3;
    pipeTop.style.right = `${pipePosition}px`;
    pipeBottom.style.right = `${pipePosition}px`;

    if (pipePosition + 60 < 0) {
      clearInterval(pipeInterval);
      pipeTop.remove();
      pipeBottom.remove();
      score++;
      document.getElementById('score').innerText = score;
    }

    // Check collision
    const birdRect = birdElement.getBoundingClientRect();
    const topRect = pipeTop.getBoundingClientRect();
    const bottomRect = pipeBottom.getBoundingClientRect();

    if (
      birdRect.right > topRect.left &&
      birdRect.left < topRect.right &&
      (birdRect.top < topRect.bottom || birdRect.bottom > bottomRect.top)
    ) {
      endGame();
    }
  }, 16);

  setTimeout(createPipe, 3000);
}

// Handle Bird Movement
function updateBird() {
  birdVelocity += gravity;
  birdY += birdVelocity;
  birdElement.style.top = `${birdY}px`;

  if (birdY + birdElement.offsetHeight >= window.innerHeight - ground.offsetHeight) {
    endGame();
  }
}

// Flap the bird
function flap() {
  birdVelocity = -8;
}

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    flap();
  }
});

// End the game
function endGame() {
  gameRunning = false;
  alert(`Game Over! Your score: ${score}`);
  window.location.reload();
}

// Start Game
function startGame() {
  setInterval(() => {
    if (gameRunning) {
      updateBird();
    }
  }, 16);
  createPipe();
}

startGame();
