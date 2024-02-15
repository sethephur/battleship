var readlineSync = require('readline-sync');
let gameOn = true;
let gameOver = false;

const locations = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3'];

function getRandomCells(arr, count = 3) {
  let cells = [];
  for (let i = 0; i < count; i++) {
    const num = Math.floor(Math.random() * arr.length);
    cells.push(arr[num]);
  }
  return cells;
}

function removeCell(arr, move) {
  const index = arr.indexOf(move.toUpperCase());
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

function getPlayerMove(moves) {
  let move = readlineSync.question(`Please enter a location to strike. ${locations[0]}-${locations.slice(-1)}: `, {
    limit: locations,
    limitMessage: 'Not a valid location. A1-C3',
  });
  if (moves.includes(move)) {
    console.log('You have already fired at that location...');
  }
  return moves.push(move);
}

function checkHit(move, arr) {
  if (arr.includes(move.toUpperCase())) {
    console.log('💥 Hit! 💥');
    removeCell(arr, move);
    console.log(`${arr.length} ship${arr.length === 1 ? ' remains...' : 's remain...'}`);
    if (arr.length === 0) {
      console.log('You win!');
      gameOver = true;
    }
  } else {
    console.log('💦 Miss! 💦');
  }
}

while (gameOn) {
  let moves = [];
  gameOver = false;
  readlineSync.keyIn('Press any key to start...');
  console.clear();
  const shipLocation = getRandomCells(locations);
  while (!gameOver) {
    getPlayerMove(moves);
    checkHit(moves[moves.length - 1], shipLocation);
  }
  gameOn = readlineSync.keyInYNStrict('You have destroyed all battleships. Would you like to play again');
  console.clear();
}
