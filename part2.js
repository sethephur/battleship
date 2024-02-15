var readlineSync = require('readline-sync');

let gameOn = true;
let size = 10;

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function placeShips() {
  let ships = [
    { size: 2, count: 1 },
    { size: 3, count: 2 },
    { size: 4, count: 1 },
    { size: 5, count: 1 },
  ]; // Ship definitions
  let placements = []; // coordinates for each ship
  let shipObjects = [];

  for (let ship of ships) {
    while (ship.count > 0) {
      let orientation = Math.random() > 0.5 ? 'H' : 'V';
      let row, col;

      if (orientation === 'H') {
        row = getRandomInt(0, size - 1);
        col = getRandomInt(0, size - 1 - ship.size);
      } else {
        row = getRandomInt(0, size - 1 - ship.size);
        col = getRandomInt(0, size - 1);
      }

      let shipCoords = [];
      for (let i = 0; i < ship.size; i++) {
        let currentRow = orientation === 'H' ? row : row + i;
        let currentCol = orientation === 'H' ? col + i : col;
        shipCoords.push(`${String.fromCharCode(65 + currentRow)}${currentCol + 1}`);
      }

      // Check for overlap
      let overlap = shipCoords.some((coord) => placements.flat().includes(coord));
      if (!overlap) {
        placements.push(shipCoords); // Add ship's coordinates as a single entry
        shipObjects.push({ coords: shipCoords, hitCount: 0 }); // Track hits per ship
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
  do {
    move = readlineSync.question('Please enter a location to strike (e.g., A5): ').toUpperCase();
  } while (!validateMove(move, moves));
  moves.push(move);
  return move;
}

function checkHit(move, shipObjects) {
  for (let ship of shipObjects) {
    const shipLength = ship.coords.length;
    if (ship.coords.includes(move)) {
      console.log('💥 Hit! 💥');
      ship.hitCount += 1;

      if (ship.hitCount === shipLength) {
        console.log('🚢 Ship Sunk! 🚢');
      }

      // Check if all ships are sunk
      if (shipObjects.every((ship) => ship.coords.length === 0)) {
        console.log('🎖️ You win! 🎖️');
        return true; // Game over
      }

      return false; // Hit, but game not over
    }
  }
  console.log('💦 Miss! 💦');
  return false; // Miss
}

while (gameOn) {
  let moves = [];
  let gameOver = false;
  readlineSync.keyIn('Press any key to start...');

  let { placements, shipObjects } = placeShips();

  while (!gameOver) {
    let move = getPlayerMove(moves);
    gameOver = checkHit(move, shipObjects);
  }

  gameOn = readlineSync.keyInYNStrict('You have destroyed all battleships. Would you like to play again?');
}
