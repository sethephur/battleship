var readlineSync = require('readline-sync');

let gameOn = true;
let size = 10;

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function calculatePosition(size, shipSize, orientation) {
  let row, col;
  if (orientation === 'H') {
    row = getRandomInt(0, size - 1);
    col = getRandomInt(0, size - 1 - shipSize);
  } else {
    row = getRandomInt(0, size - 1 - shipSize);
    col = getRandomInt(0, size - 1);
  }
  return { row, col };
}

function generateShipCoords(row, col, shipSize, orientation) {
  let shipCoords = [];
  for (let i = 0; i < shipSize; i++) {
    let currentRow = orientation === 'H' ? row : row + i;
    let currentCol = orientation === 'H' ? col + i : col;
    shipCoords.push(`${String.fromCharCode(65 + currentRow)}${currentCol + 1}`);
  }
  return shipCoords;
}

function checkOverlap(shipCoords, placements) {
  return shipCoords.some((coord) => placements.flat().includes(coord));
}

function placeShip(ship, size, placements, shipObjects) {
  let orientation = Math.random() > 0.5 ? 'H' : 'V';
  let { row, col } = calculatePosition(size, ship.size, orientation);
  let shipCoords = generateShipCoords(row, col, ship.size, orientation);

  if (!checkOverlap(shipCoords, placements)) {
    placements.push(shipCoords);
    shipObjects.push({ coords: shipCoords, hitCount: 0 });
    return true;
  }
  return false;
}

function placeShips(ships, size) {
  let placements = [];
  let shipObjects = [];

  for (let ship of ships) {
    while (ship.count > 0) {
      if (placeShip(ship, size, placements, shipObjects)) {
        ship.count--;
      }
    }
  }

  return { placements, shipObjects };
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

function checkHit(move, shipObjects) {
  for (let ship of shipObjects) {
    if (ship.coords.includes(move)) {
      console.log('💥 Hit! 💥');
      ship.hitCount += 1;
      checkShipSunk(ship); // Check if this hit sunk the ship
      return true; // Hit
    }
  }
  console.log('💦 Miss! 💦');
  return false; // Miss
}

function checkShipSunk(ship) {
  if (ship.hitCount === ship.coords.length) {
    console.log('🚢 Ship Sunk! 🚢');
  }
}

function checkAllShipsSunk(shipObjects) {
  if (shipObjects.every((ship) => ship.hitCount === ship.coords.length)) {
    console.log('🎖️ You win! 🎖️');
    return true; // Game over
  }
  return false; // Hit, but game not over
}

while (gameOn) {
  let moves = [];
  let gameOver = false;

  let ships = [
    { size: 2, count: 1 },
    { size: 3, count: 2 },
    { size: 4, count: 1 },
    { size: 5, count: 1 },
  ];

  readlineSync.keyIn('Press any key to start...');

  let { placements, shipObjects } = placeShips(ships, size);

  console.log(placements);
  while (!gameOver) {
    let move = getPlayerMove(moves);
    checkHit(move, shipObjects);
    gameOver = checkAllShipsSunk(shipObjects);
  }

  gameOn = readlineSync.keyInYNStrict('You have destroyed all battleships. Would you like to play again?');
}
