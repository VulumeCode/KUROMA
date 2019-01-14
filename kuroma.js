
Array.prototype.clone = function() {
  return this.slice(0);
};


window.devtoolsFormatters = [{
  header: function(obj){
    if (obj instanceof Array){
      return ["div",{}, obj.length + ":" + JSON.stringify(obj)]
    }
    return null;
  },
  hasBody: function(){
    return false;
  }
}]

Math.randomInt = (i) => {
  return Math.floor(Math.random() * i);
}

Math.randomIntBetween = (a,b) => {
  return a + Math.randomInt(b-a);
}

Array.prototype.swap = function (a,b) {
  [this[a],this[b]] = [this[b],this[a]];
}

var startPos = 3;
var startMaze = [
  0,0,0,1,0,1,1,0,0,0,
  0,0,0,1,0,1,1,0,0,0,
  0,0,1,1,1,1,1,0,0,0,
  0,0,1,1,0,1,1,0,0,0,
  0,0,0,1,0,1,1,1,0,0,
  0,0,1,1,0,1,1,0,1,0,
  0,0,1,1,1,1,1,1,0,0,
  0,0,0,1,0,1,1,0,0,0,
  0,0,0,1,1,1,1,0,0,0,
  0,0,0,1,0,1,1,0,0,0,
].map(x=>!!x);

// var startPos = 0;
// var startMaze = [
//   0,0,0,0,1,0,0,0,0,0,
//   0,0,1,0,0,0,0,0,0,0,
//   0,1,0,0,0,1,0,0,0,0,
//   0,0,0,1,0,0,0,0,0,0,
//   0,0,0,0,0,0,0,0,0,0,
//   0,0,0,0,0,0,0,0,0,0,
//   0,0,0,0,0,0,0,0,0,0,
//   0,0,0,0,0,0,0,0,0,0,
//   0,0,0,0,0,0,0,0,0,0,
//   0,0,0,0,0,0,0,0,0,0,
// ].map(x=>!!x);

const dirs = [
  [+2,+1],
  [-2,-1],
  [+2,-1],
  [-2,+1],
  [+1,+2],
  [-1,-2],
  [+1,-2],
  [-1,+2],
];

const genMaze = () => {
  let maze = [];
  let mazeCoords = [];

  let mazeCols = []
  for (var y = 0; y < 10; y++) {
    let mazeCol = [];
    mazeCols.push(mazeCol);
    for (var x = 0; x < 10; x++) {
      const yx = yxmerge(y,x);
      maze.push(false);
      mazeCol.push(yx);
    }
  }
  // randomly flip 2 cols
  const [swapColA, swapColB] = [Math.randomInt(10),Math.randomInt(10)];
  mazeCols.swap(swapColA, swapColB);
  mazeCoords = mazeCols.flat();

  // biased shuffle sampled from the middle.
  // not uniform, but pretty.
  // random rotation to make bias less obv.

  const rotation = Math.randomInt(2);
  let rotationOp;
  switch (rotation) {
    case 0 : rotationOp = (yx) => yxflip(yxflop(yx)); break;
    case 1 : rotationOp = (yx) => yxflip(yx); break;
    // case 2 : rotationOp = (yx) => yx; break;
    // case 3 : rotationOp = (yx) => yxflop(yx); break;
  }
  mazeCoords.sort((x,y)=>Math.random() < 0.7 ? 0 : Math.random() < 0.5 ? 1 : -1);
  for (var i = 30; i < 70; i++) {
    yx = rotationOp(mazeCoords[i]);
    maze[yx] = true;
  }

  if (countSquares(maze) != 40) {
    console.warn("gen maze wrong nr sq:"+countSquares(maze)+"\n" + mazeToStr(maze,null,null,[]));
  }
  return maze;
}

const countSquares = (maze) => {
  return maze.reduce((x,y)=>x+y,0);
}


const yxflop = (yx) => {
  return 99-yx;
}

const yxflip = (yx) => {
  const [y,x] = yxsplit(yx);
  return yxmerge(x,y);
}

const yxsplit = (yx) => {
  const x = yx % 10;
  const y = (yx - x)/10;
  return [y,x];
}

const yxmerge = (y,x) => {
  return (x)+(y*10);
}

// yx
const getMoves = (pos, maze) => {
  const [py,px] = yxsplit(pos);
  const valids = [];
  dirs.forEach(([y,x])=>{
    const dx = x + px;
    const dy = y + py;
    const dyx = yxmerge(dy,dx);
    if (maze[dyx] && dx>=0 && dy>=0 && dx<10 && dy<10){
      valids.push(dyx);
    };
  });
  return valids;
}

const makeMove = (move, maze) => {
  const newMaze = maze.clone()
  newMaze[move] = false;
  return newMaze;
}

const mazeToStr = (maze,startPos,pos,moves) => {
  let mazeStr = ""
  for (var y = 0; y < 10; y++) {
    for (var x = 0; x < 10; x++) {
      const yx = yxmerge(y,x);
      if (maze[yx]) {
        mazeStr += "■ ";
      } else if (pos == yx) {
        mazeStr += "@ ";
      } else if (startPos == yx) {
        mazeStr += "O ";
      } else if (moves.includes(yx)) {
        mazeStr += "x ";
      } else {
        mazeStr += "  ";
      };
    };
    mazeStr += "\n";
  };
  return mazeStr;
}

const displayMaze = (maze,startPos,pos,movesDone) => {
  const movesValid = getMoves(pos,maze);
  for (var yx = 0; yx < 100; yx++) {

      const square = document.getElementById(yx);
      if (movesValid.includes(yx)) {
        square.style["backgroundColor"] = "#fc9867"; // moves valid
      } else if (maze[yx]) {
        square.style["backgroundColor"] = "#454046"; // open
      } else if (pos == yx) {
        square.style["backgroundColor"] = "#ffd866"; // player
      } else if (startPos == yx) {
        square.style["backgroundColor"] = "#ff6188"; // start
      } else if (movesDone.includes(yx)) {
        square.style["backgroundColor"] = "#ff6188"; // moves done
      } else {
        square.style["backgroundColor"] = "#2c292d"; // nothing
      };
  };
}


console.log(mazeToStr(startMaze, startPos,startPos,[]))



var hist = []

// pos is not in mazeSet. the pos will never be reachable (again).
const explore = (pos, maze, movesDone) => {
  const moves = getMoves(pos, maze);
  if (moves.length > 0 && movesDone.length <= 2) {
    for (var i = moves.length - 1; i >= 0; i--) {
      const move = moves[i];

      const newMaze = makeMove(move,maze);
      explore(move, newMaze, [...movesDone,move]);
    }
  } else {
    if (true) {
      hist[movesDone.length] += 1;
      console.log(movesDone.length);
      console.log(mazeToStr(maze,startPos, pos, movesDone));
      displayMaze(maze,startPos, pos, movesDone);
      throw "ok";
    }
  }
}

// CONTROLLERS

var gamePos;
var gameTurn;
var gameMoves;
var gameMaze;
var gameStartPos;

const initMazeStatic = () => {
  gameStartPos = startPos;
  gamePos = startPos;
  gameTurn = "player";
  gameMoves = [];
  gameMaze = startMaze.clone();
  gameMaze[startPos] = false;
  draw();
}

const initMazeRandomStartPos = () => {
  gameMaze = startMaze.clone();
  while (true) {
    const tryStartPos = Math.randomInt(100);
    if (gameMaze[tryStartPos]) {
      gameStartPos = tryStartPos;
      gamePos = tryStartPos;
      gameTurn = "player";
      gameMoves = [];
      gameMaze[tryStartPos] = false;
      break;
    }
  }
  draw();
}

const initMazeRandom = () => {
  gameMaze = genMaze();
  while (true) {
    const tryStartPos = Math.randomInt(100);
    if (gameMaze[tryStartPos]) {
      gameStartPos = tryStartPos;
      gamePos = tryStartPos;
      gameTurn = "player";
      gameMoves = [];
      gameMaze[tryStartPos] = false;
      break;
    }
  }
  draw();
}

const initMaze = initMazeRandom;

const main = () => {
  hist = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,]
  // //[0,0,0,1,1,15,16,125,128,881,1124,5150,7322,26276,40349,114499,177464,413354,614092,1209871,1673876,2812520,3553537,5069489,5711220,6799384,6632516,6474294,5294300,4107834,2690179,1582666,767482,312806,96633,23167,3508,332,0,0,0,0,0,0]
  explore(startPos, startMaze, [])
  console.log(hist)
}

const draw = () => {
  displayMaze(gameMaze, gameStartPos,gamePos,gameMoves)
}

const playerClick = (move) => {
  const movesValid = getMoves(gamePos,gameMaze);
  if(movesValid.includes(move)){
    gameMoves.push(move);
    gameMaze = makeMove(move,gameMaze);
    gamePos = move;
    gameTurn = "player";
  }
  draw();
  const movesValidNext = getMoves(gamePos,gameMaze);
  if (movesValidNext.length == 0) {
    console.log("score: " + gameMoves.length);
    initMaze();
  }
}



// document.getElementById(64).animate([
//   // keyframes
//   { width: '0%' },
//   { width: '100%' }
// ], {
//   // timing options
//   duration: 1000,
//   iterations: 1
// });




// const mazeToSet = (maze) => {
//   const mazeSet = [];
//   maze.forEach((row,y) => {
//     row.forEach((val,x) => {
//       if(!!val){
//         mazeSet.push([x,y])
//       }
//     });
//   });
//   return mazeSet;
// }

// const mazeToStr = (maze) => {
//   let mazeStr = ""
//   maze.forEach((row) => {
//     row.forEach((val) => {
//       mazeStr += val==1 ? "■ " : "  ";
//     });
//     mazeStr += "\n";
//   })
//   return mazeStr;
// }

// const makeMove = (move, mazeSet) => {
//   const [movex,movey] = move;
//   const newMazeSet = [];
//   for (var i = mazeSet.length - 1; i >= 0; i--) {
//     const [mazex,mazey] = mazeSet[i];
//     if (!(mazex==movex && mazey==movey)) {
//       newMazeSet.push(mazeSet[i]);
//     };
//   };
//   return newMazeSet;
// }
