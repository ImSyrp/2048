// game.js
const gridSize = 4;
const cells = [];
const grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
let score = 0;

function isGameOver() {
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (grid[row][col] === 0) {
        return false; // Todavía hay celdas vacías, el juego no ha terminado
      }
      if (
        isValidPosition(row + 1, col) && grid[row][col] === grid[row + 1][col] ||
        isValidPosition(row, col + 1) && grid[row][col] === grid[row][col + 1]
      ) {
        return false; // Todavía hay movimientos posibles
      }
    }
  }
  return true; // No hay movimientos posibles, el jugador perdió
}

function showGameOverMessage() {
  const gameOverMessage = document.createElement('div');
  gameOverMessage.className = 'game-over-message';
  gameOverMessage.textContent = 'Game Over. ¿Quieres jugar de nuevo?';

  const retryButton = document.createElement('button');
  retryButton.textContent = 'Reintentar';
  retryButton.addEventListener('click', () => {
    resetGame();
    gameOverMessage.remove();
  });

  gameOverMessage.appendChild(retryButton);

  document.body.appendChild(gameOverMessage);
}

function resetGame() {
  cells.forEach(cell => {
    cell.querySelector('span').textContent = '';
  });

  grid.forEach(row => row.fill(0));

  score = 0;
  updateDisplay();
  generateRandomTile();
  generateRandomTile();
}

function initializeGame() {
  const gameContainer = document.querySelector('.game-container');

  for (let i = 0; i < gridSize * gridSize; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.innerHTML = '<span></span>';
    gameContainer.appendChild(cell);
    cells.push(cell);
  }

  generateRandomTile();
  generateRandomTile();
  updateDisplay();
}

// ... (Código previo)

// Definir las coordenadas iniciales y finales del deslizamiento
let startX, startY, endX, endY;

// Manejar evento de inicio de deslizamiento táctil
document.addEventListener('touchstart', (event) => {
  startX = event.touches[0].clientX;
  startY = event.touches[0].clientY;
});

// Manejar evento de final de deslizamiento táctil
document.addEventListener('touchend', (event) => {
  endX = event.changedTouches[0].clientX;
  endY = event.changedTouches[0].clientY;

  // Determinar dirección del deslizamiento
  const deltaX = endX - startX;
  const deltaY = endY - startY;

  let direction;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    direction = deltaX > 0 ? 'right' : 'left';
  } else {
    direction = deltaY > 0 ? 'down' : 'up';
  }

  if (direction) {
    if (moveTiles(direction)) {
      setTimeout(() => {
        generateRandomTile();
        updateDisplay();
      }, 200); // Esperar a que termine la animación
    }
  }
});

// ... (Código posterior)


function generateRandomTile() {
  const emptyCells = cells.filter(cell => cell.innerText === '');
  if (emptyCells.length === 0) return;

  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const row = Math.floor(cells.indexOf(randomCell) / gridSize);
  const col = cells.indexOf(randomCell) % gridSize;
  grid[row][col] = Math.random() < 0.9 ? 2 : 4;
}

function updateDisplay() {
  cells.forEach((cell, index) => {
    const value = grid[Math.floor(index / gridSize)][index % gridSize];
    cell.innerHTML = '<span></span>';
    if (value !== 0) {
      cell.style.backgroundColor = `#${getColorForValue(value)}`;
      cell.querySelector('span').innerText = value;
    } else {
      cell.style.backgroundColor = '#eee';
    }
  });

  document.getElementById('score').innerText = score;
}

function getColorForValue(value) {
  const colors = {
    '2': 'eee4da',
    '4': 'ede0c8',
    '8': 'f2b179',
    '16': 'f59563',
    '32': 'f67c5f',
    '64': 'f65e3b',
    '128': 'edcf72',
    '256': 'edcc61',
    '512': 'edc850',
    '1024': 'edc53f',
    '2048': 'edc22e',
  };
  return colors[value] || 'ccc0b4';
}

function handleKeyPress(event) {
  const keyMap = {
    'ArrowUp': 'up',
    'ArrowDown': 'down',
    'ArrowLeft': 'left',
    'ArrowRight': 'right',
  };

  const direction = keyMap[event.key];
  if (direction) {
    if (moveTiles(direction)) {
      setTimeout(() => {
        generateRandomTile();
        updateDisplay();
      }, 200); // Wait for the animation to complete
    }
  }
}

function moveTiles(direction) {
  const animations = [];
  let moved = false;

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (grid[row][col] !== 0) {
        const move = moveTile(direction, row, col);
        if (move) {
          animations.push(move);
          moved = true;
        }
      }
    }
  }

  if (moved) {
    animateMovement(direction, animations);
    return true;
  }

  return false;
}

function moveTile(direction, row, col) {
  if (grid[row][col] === 0) {
    return null; // No tile to move
  }

  let newRow = row;
  let newCol = col;
  let moved = false;

  while (true) {
    const nextRow = newRow + getRowIncrement(direction);
    const nextCol = newCol + getColIncrement(direction);

    if (!isValidPosition(nextRow, nextCol)) {
      break; // Reached the edge of the grid
    }

    if (grid[nextRow][nextCol] === 0) {
      // Move tile to an empty cell
      grid[nextRow][nextCol] = grid[newRow][newCol];
      grid[newRow][newCol] = 0;
      newRow = nextRow;
      newCol = nextCol;
      moved = true;
    } else if (grid[nextRow][nextCol] === grid[newRow][newCol]) {
      // Merge tiles of the same value
      grid[nextRow][nextCol] *= 2;
      score += grid[nextRow][nextCol];
      grid[newRow][newCol] = 0;
      moved = true;
      break;
    } else {
      break; // Cannot move or merge
    }
  }

  if (moved) {
    return { fromRow: row, fromCol: col, toRow: newRow, toCol: newCol };
  }

  return null;
}

function animateMovement(direction, animations) {
  animations.forEach(move => {
    const fromCell = cells[move.fromRow * gridSize + move.fromCol];
    const toCell = cells[move.toRow * gridSize + move.toCol];

    const fromPosition = getPosition(fromCell);
    const toPosition = getPosition(toCell);

    const offsetTop = toPosition.top - fromPosition.top;
    const offsetLeft = toPosition.left - fromPosition.left;

    fromCell.style.transform = `translate(${offsetLeft}px, ${offsetTop}px)`;
    fromCell.style.transition = 'transform 0.15s ease-in-out';

    setTimeout(() => {
      fromCell.style.transform = '';
      fromCell.style.transition = '';
      updateDisplay();
    }, 150);
  });
}

function getPosition(element) {
  const rect = element.getBoundingClientRect();
  return { top: rect.top, left: rect.left };
}

function isValidPosition(row, col) {
  return row >= 0 && row < gridSize && col >= 0 && col < gridSize;
}

function getRowIncrement(direction) {
  if (direction === 'up') return -1;
  if (direction === 'down') return 1;
  return 0;
}

function getColIncrement(direction) {
  if (direction === 'left') return -1;
  if (direction === 'right') return 1;
  return 0;
}


initializeGame();
document.addEventListener('keydown', handleKeyPress);


