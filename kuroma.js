
var startPos = 3
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
].map(x=>!!x)

// var startPos = 0
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
// ].map(x=>!!x)

var testStartPos = 0
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
].map(x=>!!x)

const dirs = [
  [+2,+1],
  [-2,-1],
  [+2,-1],
  [-2,+1],
  [+1,+2],
  [-1,-2],
  [+1,-2],
  [-1,+2],
]
var mazeCoords = []
const genMaze = () => {
  let maze = []
  mazeCoords = []

  let mazeCols = []
  for (let y = 0; y < 10; y++) {
    let mazeCol = []
    mazeCols.push(mazeCol)
    for (let x = 0; x < 10; x++) {
      const yx = yxmerge(y,x)
      maze.push(false)
      mazeCol.push(yx)
    }
  }
  // TODO compare
  // // randomly flip 2 cols
  // [swapColA, swapColB] = [Math.randomInt(10),Math.randomInt(10)]
  // mazeCols.swap(swapColA, swapColB)
  // // console.log(swapColA, swapColB)
  // [swapColA, swapColB] = [Math.randomInt(10),Math.randomInt(10)]
  // mazeCols.swap(swapColA, swapColB)
  // // console.log(swapColA, swapColB)

  // shuffle cols
  mazeCols.sort((x,y)=>Math.random() < 0.3 ? 0 : Math.random() < 0.5 ? 1 : -1)
  mazeCoords = mazeCols.flat()

  // biased shuffle sampled from the middle.
  // not uniform, but pretty.
  // random rotation to make bias less obv.

  const rotation = Math.randomInt(2)
  let rotationOp
  switch (rotation) {
    case 0 : rotationOp = (yx) => yxflip(yxflop(yx)); break;
    case 1 : rotationOp = (yx) => yxflip(yx); break;
    // case 2 : rotationOp = (yx) => yx; break;
    // case 3 : rotationOp = (yx) => yxflop(yx); break;
  }
  mazeCoords.sort((x,y)=>Math.random() < 0.7 ? 0 : Math.random() < 0.5 ? 1 : -1)
  for (let i = 30; i < 70; i++) {
    yx = rotationOp(mazeCoords[i])
    maze[yx] = true
  }

  if (countSquares(maze) != 40) {
    throw ("gen maze wrong nr sq:"+countSquares(maze)+"\n" + mazeToStr(maze,null,null,[]))
  }

  if (offCenter(maze) != 0) {
    console.debug("gen offcenter:\ndecMaze(\""+ encMaze(maze)+"\")")
    maze = genMaze() // try again
  } else if (! allSquaresReachableN(maze,25)) {
    console.debug("gen maze not all reachable:\ndecMaze(\""+ encMaze(maze)+"\")")
    maze = genMaze() // try again
  } else {
    console.debug("good maze!\ndecMaze(\""+ encMaze(maze)+"\")")
  }


  return maze
}


const encMaze = (maze) => {
  const sliceA = maze.slice(0,50).reduce((a,t)=>a+String(t|0),"")
  const sliceB = maze.slice(50,100).reduce((a,t)=>a+String(t|0),"")
  const intA = (parseInt(sliceA,2))
  const intB = (parseInt(sliceB,2))
  const code = btoa(intA)+":"+btoa(intB)
  return code
}

const decMaze = (code) => {
  const [codeA,codeB] = code.split(":")
  const intA = atob(codeA)
  const intB = atob(codeB)
  const sliceA = (intA*1).toString(2)
  const sliceB = (intB*1).toString(2)
  const slicePadA = "0".repeat(50-sliceA.length) + sliceA
  const slicePadB = "0".repeat(50-sliceB.length) + sliceB
  const maze = [...slicePadA,...slicePadB].map(x=>!!(x|0))
  return maze
}


const offCenter = (maze) => {
  let xsum = 0
  let xcount = 0
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      if(maze[yxmerge(y,x)]){
        xsum += x
        xcount += 1
      }
    }
  }
  return Math.trunc((xsum/xcount)-4.5)
}


const allSquaresReachableN = (maze, n) => {
  for (let yx = 0; yx < 100; yx++) {
    if (maze[yx]) {
      if (! reachableN(maze,yx,n)) {
        return false
      }
    }
  }
  return true
}

const reachableN = (maze, yx, n) => {
  if (n==0) {
    return true
  }
  const reachable = getMoves(yx,maze)
  if (reachable.length == 0) {
    return false
  }
  for (let move of reachable) {
    const newMaze = makeMove(move, maze)
    if (reachableN(newMaze, move, n-1)) {
      return true
    }
  }
  return false
}

const countSquares = (maze) => {
  return maze.reduce((x,y)=>x+y,0)
}


const yxflop = (yx) => {
  return 99-yx
}

const yxflip = (yx) => {
  const [y,x] = yxsplit(yx)
  return yxmerge(x,y)
}

const yxsplit = (yx) => {
  const x = yx % 10
  const y = (yx - x)/10
  return [y,x]
}

const yxmerge = (y,x) => {
  return (x)+(y*10)
}

// yx
const getMoves = (pos, maze) => {
  const [py,px] = yxsplit(pos)
  const valids = []
  dirs.forEach(([y,x])=>{
    const dx = x + px
    const dy = y + py
    const dyx = yxmerge(dy,dx)
    if (maze[dyx] && dx>=0 && dy>=0 && dx<10 && dy<10){
      valids.push(dyx)
    }
  })
  return valids
}

const makeMove = (move, maze) => {
  const newMaze = maze.clone()
  newMaze[move] = false
  return newMaze
}

const mazeToStr = (maze,startPos,pos,moves) => {
  let mazeStr = ""
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const yx = yxmerge(y,x)
      if (maze[yx]) {
        mazeStr += "■ "
      } else if (pos == yx) {
        mazeStr += "@ "
      } else if (startPos == yx) {
        mazeStr += "O "
      } else if (!!moves && moves.includes(yx)) {
        mazeStr += "x "
      } else {
        mazeStr += "  "
      }
    }
    mazeStr += "\n"
  }
  return mazeStr
}



console.log(mazeToStr(startMaze, startPos,startPos,[]))



var hist = []

// pos is not in mazeSet. the pos will never be reachable (again).
const explore = (pos, maze, movesDone) => {
  const moves = getMoves(pos, maze)
  if (moves.length > 0 && movesDone.length <= 2) {
    for (let move of moves) {
      const newMaze = makeMove(move,maze)
      explore(move, newMaze, [...movesDone,move])
    }
  } else {
    if (true) {
      hist[movesDone.length] += 1
      console.log(movesDone.length)
      console.log(mazeToStr(maze,startPos, pos, movesDone))
      view.drawMaze(maze,startPos, pos, movesDone)
      throw "ok"
    }
  }
}

const main = () => {
  hist = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,]
  // //[0,0,0,1,1,15,16,125,128,881,1124,5150,7322,26276,40349,114499,177464,413354,614092,1209871,1673876,2812520,3553537,5069489,5711220,6799384,6632516,6474294,5294300,4107834,2690179,1582666,767482,312806,96633,23167,3508,332,0,0,0,0,0,0]
  explore(startPos, startMaze, [])
  console.log(hist)
}

// CONTROLLERS


const game = {
  pos : 0,
  turn : "",
  moves : [],
  maze : [],
  startMaze : [],
  startPos : 0,
  stats : [],
  statsComputer : 0,
  statsHuman : 0,
  ai : ai.none,
}

const initMazeStatic = () => {
  game.startPos = startPos
  game.pos = startPos
  game.moves = [startPos]
  game.maze = startMaze.clone()
  game.maze[startPos] = false
  game.startMaze = game.maze
  game.turn = "human"
}

const initMazeRandomStartPos = () => {
  game.maze = startMaze.clone()
  while (true) {
    const tryStartPos = Math.randomInt(100)
    if (game.maze[tryStartPos]) {
      game.startPos = tryStartPos
      game.pos = tryStartPos
      game.moves = [tryStartPos]
      game.maze[tryStartPos] = false
      game.startMaze = game.maze
      game.turn = "human"
      break
    }
  }
}

const initMazeRandom = () => {
  game.maze = genMaze()
  while (true) {
    const tryStartPos = Math.randomInt(100)
    if (game.maze[tryStartPos]) {
      game.startPos = tryStartPos
      game.pos = tryStartPos
      game.moves = [tryStartPos]
      game.maze[tryStartPos] = false
      game.startMaze = game.maze.clone()
      game.turn = "human"
      break
    }
  }
}

const initMaze = () => {
  $(window).scrollTop(0)

  const loadStats = localStorage.getItem('stats')
  if (loadStats){
    game.stats = JSON.parse(loadStats)
  } else {
    game.stats = []
  }

  view.drawGame(game).finished.then(()=>{
    view.mazeDisappear(game.moves).finished.then(()=>{
      initMazeRandom()
      view.drawGame(game).finished.then(()=>{
        view.mazeAppear()
      })
    })
  })
}


const playerClick = (move) => {
  console.debug("click", move)
  view.boxClick(move)

  const movesValid = getMoves(game.pos,game.maze)
  if(movesValid.includes(move)){
    game.moves.push(move)
    game.maze = makeMove(move,game.maze)

    game.pos = move



    const movesValidNext = getMoves(game.pos,game.maze)
    for (let moveValidNext of movesValidNext) {
      view.boxClick(moveValidNext)
    }
    // GAME OVER
    if (movesValidNext.length == 0) {
      switch (game.turn) {
        case "computer": game.statsComputer+=game.moves.length-1;break;
        case "human": game.statsHuman+=game.moves.length-1;break;
      }

      game.stats.push(game.moves.length-1)
      localStorage.setItem("stats", JSON.stringify(game.stats))
      console.log("Score: " + (game.stats.slice(-1)))
      initMaze()
    } else {
      switch (game.turn) {
        case "human":
          game.turn = "computer"
          setTimeout(function(){
            playerClick(game.ai(game.pos,game.maze))
          },800)
          break
        case "computer":
          game.turn = "human"
          break
        default:
      }


      view.drawGame(game)
    }
  }
}

const clickRestart = () => {
  $(window).scrollTop(0)

  game.startPos = game.startPos
  game.pos = game.startPos
  game.turn = "human"
  game.moves = []
  game.maze = game.startMaze
  game.startMaze = game.maze
  view.drawGame(game)
}

const clickReset = () => {
  $(window).scrollTop(0)

  game.statsComputer = 0
  game.statsHuman = 0
  localStorage.setItem("stats", JSON.stringify([]))
  initMaze()
}

const setAI = (ai_name) => {
  document.querySelector(".active").classList.remove("active")
  game.ai = ai[ai_name]
  document.getElementById(ai_name).classList.add("active")
}




const initMazeHTML = () => {
  const mazeEl = document.getElementById("maze")
  for (let yx = 0; yx < 100; yx++) {
    const boxDiv = document.createElement('div')
    mazeEl.appendChild(boxDiv)
    boxDiv.id = 'box' + yx
    boxDiv.className = 'box'
    boxDiv.onclick = (()=>playerClick(yx))
  }

  document.documentElement.style.setProperty("--color-nothing", colors.nothing)
  document.documentElement.style.setProperty("--color-text", colors.startPos)
  document.documentElement.style.setProperty("--color-border", colors.playerPos)

  initMaze()
}



// const boxMouseDown = (yx) => {
//   view.boxMouseDown(yx)
// }
// const boxMouseUp = (yx) => {
//   view.boxMouseUp(yx)
// }

// // infinite scroll TODO throttle
// $(document).ready(function() {
//     var bgHeight = $(document).height() // pixel height of background image
//     $('body').height( bgHeight + $(window).height() )
//     $(window).scroll(function() {
//         if ( $(window).scrollTop() >= ($('body').height() - $(window).height()) ) {
//             $(window).scrollTop(10)
//         }
//         else if ( $(window).scrollTop() == 0 ) {
//             $(window).scrollTop($('body').height() - $(window).height() -10)
//         }
//     })
// })
// $(window).resize(function() {
//     $('body').height( bgHeight + $(window).height() )
// })
