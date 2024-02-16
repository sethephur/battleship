var readlineSync = require('readline-sync');

let gameOn = true;
let size = 10;

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildGrid(size) {
  let grid = [];
  for (let row = 0; row < size; row++) {
    let rowArray = [];
    for (let col = 0; col < size; col++) {
      rowArray.push('🟦');
    }
    grid.push(rowArray);
  }
  return grid;
}

function printGrid(grid) {
  console.log('  ' + Array.from({ length: size }, (_, i) => i + 1).join('  '));
  grid.forEach((row, index) => {
    console.log(String.fromCharCode('A'.charCodeAt(0) + index) + ' ' + row.join(' '));
  });
}

function getAdjacentCoords(coord) {
  const row = coord.charCodeAt(0) - 'A'.charCodeAt(0);
  const col = parseInt(coord.substring(1), 10) - 1;
  const adjacentCoords = [];

  for (let dRow = -1; dRow <= 1; dRow++) {
    for (let dCol = -1; dCol <= 1; dCol++) {
      if (row + dRow >= 0 && row + dRow < size && col + dCol >= 0 && col + dCol < size) {
        adjacentCoords.push(`${String.fromCharCode(65 + row + dRow)}${col + dCol + 1}`);
      }
    }
  }
  return adjacentCoords;
}

function placeShips() {
  let ships = [
    { size: 2, count: 1 },
    { size: 3, count: 2 },
    { size: 4, count: 1 },
    { size: 5, count: 1 },
  ]; // Ship definitions
  let placements = []; // Coordinates for each ship
  let shipObjects = [];

  for (let ship of ships) {
    while (ship.count > 0) {
      let orientation = Math.random() > 0.5 ? 'H' : 'V';
      let row, col;

      if (orientation === 'H') {
        row = getRandomInt(0, size - 1);
        col = getRandomInt(0, size - ship.size);
      } else {
        row = getRandomInt(0, size - ship.size);
        col = getRandomInt(0, size - 1);
      }

      let shipCoords = [];
      for (let i = 0; i < ship.size; i++) {
        let currentRow = orientation === 'H' ? row : row + i;
        let currentCol = orientation === 'H' ? col + i : col;
        shipCoords.push(`${String.fromCharCode(65 + currentRow)}${currentCol + 1}`);
      }

      // Generate a list of all cells that would be adjacent to the ship
      let bufferZone = shipCoords.reduce((acc, coord) => acc.concat(getAdjacentCoords(coord)), []);

      // Check for overlap with existing ships or their buffer zones
      let overlap = shipCoords.some((coord) => placements.flat().includes(coord)) || bufferZone.some((coord) => placements.flat().includes(coord));
      if (!overlap) {
        placements.push(shipCoords); // Add ship's coordinates as a single entry
        // Inside placeShips, when you're pushing ship objects
        shipObjects.push({ coords: [...shipCoords], originalCoords: [...shipCoords], hitCount: 0, size: ship.size });
        ship.count--;
      }
    }
  }

  return { placements, shipObjects }; // Return both placements for debugging and ship objects for game logic
}

function validateMove(move, moves) {
  return /^[A-J](10|[1-9])$/.test(move) && !moves.includes(move.toUpperCase());
}

function getPlayerMove(moves) {
  let move;
  while (true) {
    move = readlineSync.question('Please enter a location to strike (e.g., A5): ').toUpperCase();
    if (moves.includes(move)) {
      console.log('You have already fired at that location!');
      continue;
    }
    if (!validateMove(move, moves)) {
      console.log('Invalid move. Please enter a valid location (e.g., A5).');
      continue;
    }
    break;
  }
  moves.push(move);
  return move;
}

function checkHit(move, shipObjects, board) {
  let hit = false;
  let shipSunk = null;
  let boardPosition = decodePosition(move);

  for (let ship of shipObjects) {
    if (ship.coords.includes(move)) {
      board[boardPosition.rowIndex][boardPosition.columnIndex] = '💥';
      ship.hitCount += 1;
      ship.coords.splice(ship.coords.indexOf(move), 1); // Remove the hit coordinate

      if (ship.hitCount === ship.size) {
        console.log('🚢 Ship Sunk! 🚢');
        shipSunk = ship; // Mark this ship as sunk
      }
      hit = true;
      break; // Exit loop after a hit
    }
  }

  if (!hit) {
    board[boardPosition.rowIndex][boardPosition.columnIndex] = '💦';
  }

  if (shipSunk) {
    fillAdjacentSpaces(shipSunk, board);
  }

  return shipObjects.every((ship) => ship.coords.length === 0); // Check if game is over
}

function fillAdjacentSpaces(sunkShip, board) {
  sunkShip.originalCoords.forEach((coord) => {
    let adjacentCoords = getAdjacentCoords(coord);
    adjacentCoords.forEach((adjCoord) => {
      let { rowIndex, columnIndex } = decodePosition(adjCoord);
      if (board[rowIndex][columnIndex] === '🟦') {
        // Only fill unhit spaces
        board[rowIndex][columnIndex] = '💦';
      }
    });
  });
}

function decodePosition(position) {
  // get the row letter and column number from the position
  let letter = position.charAt(0);
  let number = parseInt(position.substring(1), 10);

  // Convert the row letter to a 0-based row index
  let rowIndex = letter.charCodeAt(0) - 'A'.charCodeAt(0);

  // Adjust the column number to be 0-based
  let columnIndex = number - 1;

  return { rowIndex, columnIndex };
}

while (gameOn) {
  let moves = [];
  let gameOver = false;
  readlineSync.keyIn('Press any key to start...');
  console.clear();
  let board = buildGrid(size);
  let { placements, shipObjects } = placeShips();
  printGrid(board);

  while (!gameOver) {
    let move = getPlayerMove(moves);
    gameOver = checkHit(move, shipObjects, board);
    console.clear();
    printGrid(board);
  }

  gameOn = readlineSync.keyInYNStrict('You have destroyed all battleships. Would you like to play again?');
}
