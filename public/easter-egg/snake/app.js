const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const statusEl = document.getElementById("status");
const controls = document.querySelectorAll(".control");

const debug = new URLSearchParams(window.location.search).get("debug") === "1";

const gridSize = 21;
const cellSize = canvas.width / gridSize;
const speedMs = 130;

let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let food = { x: 10, y: 10 };
let score = 0;
let gameTimer = null;
let running = false;

const debugLog = (...args) => {
  if (debug) {
    console.log("[snake]", ...args);
  }
};

const resetGame = () => {
  snake = [
    { x: 9, y: 10 },
    { x: 8, y: 10 },
    { x: 7, y: 10 }
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  running = false;
  statusEl.textContent = "";
  scoreEl.textContent = "0";
  placeFood();
  draw();
};

const placeFood = () => {
  let position = null;
  while (!position || snake.some(segment => segment.x === position.x && segment.y === position.y)) {
    position = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize)
    };
  }
  food = position;
};

const draw = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#0f2a1c";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#f9d65c";
  ctx.beginPath();
  ctx.arc(
    food.x * cellSize + cellSize / 2,
    food.y * cellSize + cellSize / 2,
    cellSize / 3,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.fillStyle = "#f48c1c";
  snake.forEach(segment => {
    ctx.fillRect(segment.x * cellSize + 1, segment.y * cellSize + 1, cellSize - 2, cellSize - 2);
  });
};

const tick = () => {
  direction = { ...nextDirection };
  const head = {
    x: (snake[0].x + direction.x + gridSize) % gridSize,
    y: (snake[0].y + direction.y + gridSize) % gridSize
  };

  if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 1;
    scoreEl.textContent = String(score);
    placeFood();
  } else {
    snake.pop();
  }

  debugLog("tick", { score, direction, head, speedMs });
  draw();
};

const startGame = () => {
  if (running) return;
  running = true;
  startBtn.hidden = true;
  restartBtn.hidden = false;
  statusEl.textContent = "";
  clearInterval(gameTimer);
  gameTimer = setInterval(tick, speedMs);
};

const endGame = () => {
  running = false;
  clearInterval(gameTimer);
  statusEl.textContent = "Game over. Press Restart to try again.";
};

const restartGame = () => {
  resetGame();
  startGame();
};

const setDirection = newDirection => {
  if (!running) return;
  const isOpposite =
    direction.x + newDirection.x === 0 && direction.y + newDirection.y === 0;
  if (!isOpposite) {
    nextDirection = newDirection;
  }
};

const keyHandler = event => {
  switch (event.key.toLowerCase()) {
    case "arrowup":
    case "w":
      setDirection({ x: 0, y: -1 });
      break;
    case "arrowdown":
    case "s":
      setDirection({ x: 0, y: 1 });
      break;
    case "arrowleft":
    case "a":
      setDirection({ x: -1, y: 0 });
      break;
    case "arrowright":
    case "d":
      setDirection({ x: 1, y: 0 });
      break;
    default:
      break;
  }
};

const setupTouchControls = () => {
  let touchStart = null;
  canvas.addEventListener("touchstart", event => {
    const touch = event.touches[0];
    touchStart = { x: touch.clientX, y: touch.clientY };
  });

  canvas.addEventListener("touchend", event => {
    if (!touchStart) return;
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      setDirection({ x: deltaX > 0 ? 1 : -1, y: 0 });
    } else {
      setDirection({ x: 0, y: deltaY > 0 ? 1 : -1 });
    }
    touchStart = null;
  });
};

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);
controls.forEach(control => {
  control.addEventListener("click", () => {
    const dir = control.dataset.dir;
    if (dir === "up") setDirection({ x: 0, y: -1 });
    if (dir === "down") setDirection({ x: 0, y: 1 });
    if (dir === "left") setDirection({ x: -1, y: 0 });
    if (dir === "right") setDirection({ x: 1, y: 0 });
  });
});

window.addEventListener("keydown", keyHandler);
setupTouchControls();
resetGame();
