
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

var testStartPos = 0;
var testMaze = [
  0,0,0,0,0,0,0,0,0,0,
  0,0,1,0,0,0,0,0,0,0,
  0,1,0,0,0,0,0,0,0,0,
  0,0,0,1,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,
].map(x=>!!x);

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
  [swapColA, swapColB] = [Math.randomInt(10),Math.randomInt(10)];
  mazeCols.swap(swapColA, swapColB);
  // console.log(swapColA, swapColB);
  [swapColA, swapColB] = [Math.randomInt(10),Math.randomInt(10)];
  mazeCols.swap(swapColA, swapColB);
  // console.log(swapColA, swapColB);

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
    throw ("gen maze wrong nr sq:"+countSquares(maze)+"\n" + mazeToStr(maze,null,null,[]));
  }

  if (! allSquaresReachableN(maze,10)) {
    console.debug("gen maze not all reachable:\n"+ encMaze(maze));
    maze = genMaze(); // try again
  }
  return maze;
}


const encMaze = (maze) => {
  const sliceA = maze.slice(0,50).reduce((a,t)=>a+String(t|0),"");
  const sliceB = maze.slice(50,100).reduce((a,t)=>a+String(t|0),"");
  const intA = (parseInt(sliceA,2));
  const intB = (parseInt(sliceB,2));
  const code = btoa(intA)+":"+btoa(intB);
  return code;
}

const decMaze = (code) => {
  const [codeA,codeB] = code.split(":");
  const intA = atob(codeA);
  const intB = atob(codeB);
  const sliceA = (intA*1).toString(2);
  const sliceB = (intB*1).toString(2);
  const slicePadA = "0".repeat(50-sliceA.length) + sliceA;
  const slicePadB = "0".repeat(50-sliceB.length) + sliceB;
  const maze = [...slicePadA,...slicePadB].map(x=>!!(x|0));
  return maze;
}

const allSquaresReachableN = (maze, n) => {
  for (var yx = 0; yx < 100; yx++) {
    if (maze[yx]) {
      if (! reachableN(maze,yx,n)) {
        return false;
      }
    }
  }
  return true;
}

const reachableN = (maze, yx, n) => {
  if (n==0) {
    return true;
  }
  const reachable = getMoves(yx,maze);
  if (reachable.length == 0) {
    return false;
  }
  for (var i = reachable.length - 1; i >= 0; i--) {
    const move = reachable[i];
    const newMaze = makeMove(move, maze);
    if (reachableN(newMaze, move, n-1)) {
        return true;
    }
  }
  return false ;
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
      const square = document.getElementById(yx)
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

const displayStats = () => {
  const scoreElem = document.getElementById("score");
  scoreElem.textContent = "Score\xa0\xa0\xa0" + (game.moves.length+1) + "p";

  const maxElem = document.getElementById("max");
  maxElem.textContent = "Max\xa0\xa0\xa0" + Math.max(...game.stats) + "p";

  const gamesElem = document.getElementById("games");
  gamesElem.textContent = "Games\xa0\xa0\xa0" + game.stats.length;

  const rankElem = document.getElementById("rank");
  rankElem.textContent = "Rank\xa0\xa0\xa0#" + Math.floor(100-(100*((game.stats.reduce((a,b) => a+b, 0) / (40*game.stats.length))||0)));
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

const game = {
  pos : null,
  turn : null,
  moves : null,
  maze : null,
  startPos : null,
  stats : null,
}

const initMazeStatic = () => {
  game.startPos = startPos;
  game.pos = startPos;
  game.turn = "player";
  game.moves = [];
  game.maze = startMaze.clone();
  game.maze[startPos] = false;
  draw();
}

const initMazeRandomStartPos = () => {
  game.maze = startMaze.clone();
  while (true) {
    const tryStartPos = Math.randomInt(100);
    if (game.maze[tryStartPos]) {
      game.startPos = tryStartPos;
      game.pos = tryStartPos;
      game.turn = "player";
      game.moves = [];
      game.maze[tryStartPos] = false;
      break;
    }
  }
  draw();
}

const initMazeRandom = () => {
  game.maze = genMaze();
  while (true) {
    const tryStartPos = Math.randomInt(100);
    if (game.maze[tryStartPos]) {
      game.startPos = tryStartPos;
      game.pos = tryStartPos;
      game.turn = "player";
      game.moves = [];
      game.maze[tryStartPos] = false;
      break;
    }
  }
  draw();
}

const initMaze = () => {
  const loadStats = localStorage.getItem('stats');
  if (loadStats){
    game.stats = JSON.parse(loadStats)
  } else {
    game.stats = []
  }
  initMazeRandom();
  for (var yx = 0; yx < 100; yx++) {
    const square = document.getElementById(yx);
    square.animate([
      // keyframes
      { margin: '16px' },
      { margin: '0px' }
    ], {
      // timing options
      duration: 200,
      iterations: 1
    });
  }
}

const main = () => {
  hist = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,]
  // //[0,0,0,1,1,15,16,125,128,881,1124,5150,7322,26276,40349,114499,177464,413354,614092,1209871,1673876,2812520,3553537,5069489,5711220,6799384,6632516,6474294,5294300,4107834,2690179,1582666,767482,312806,96633,23167,3508,332,0,0,0,0,0,0]
  explore(startPos, startMaze, [])
  console.log(hist)
}

const draw = () => {
  displayMaze(game.maze, game.startPos,game.pos,game.moves)

  displayStats(game.stats)
}

const playerClick = (move) => {
  const movesValid = getMoves(game.pos,game.maze);
  if(movesValid.includes(move)){
    game.moves.push(move);
    game.maze = makeMove(move,game.maze);

    game.pos = move;
    game.turn = "player";
  }
  draw();
  const square = document.getElementById(move);
  square.animate([
    // keyframes
    { margin: '4px' },
    { margin: '0px' }
  ], {
    // timing options
    duration: 200,
    iterations: 1
  });
  const movesValidNext = getMoves(game.pos,game.maze);

  // GAME OVER
  if (movesValidNext.length == 0) {
    console.log("score: " + (game.moves.length+1));
    game.stats.push(game.moves.length+1);
    localStorage.setItem("stats", JSON.stringify(game.stats))
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
