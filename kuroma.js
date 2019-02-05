
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

const dirs = [
  [-2,-1],
  [-2,+1],
  [-1,+2],
  [+1,+2],
  [+2,+1],
  [+2,-1],
  [+1,-2],
  [-1,-2],
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

// STATE

const game = {
  pos : 0,
  turn : "",
  vs : "zenself",
  moves : [],
  maze : [],
  startMaze : [],
  startPos : 0,
  stats : {
    "zenself": {
      score: 0,
      scores: [],
    },
    "zenmaster": {
      score: 0,
      scores: [],
    },
    "zenmonk": {
      score: 0,
      scores: [],
    },
    "zendrunk": {
      score: 0,
      scores: [],
    },
    "vsother": {
      youscore: 0,
      otherscore: 0,
      scores: [],
    },
    "vsronin": {
      youscore: 0,
      otherscore: 0,
      scores: [],
    },
    "vssamurai": {
      youscore: 0,
      otherscore: 0,
      scores: [],
    },
    "vsninja": {
      youscore: 0,
      otherscore: 0,
      scores: [],
    },
  },
  ai : null,
  showHelp: false,
}


const gameMode = (vs) => {
  if (vs.startsWith("vs")){
    return "vs"
  } else {
    return "zen"
  }
}
const gameVSMode = (vs) => {
  switch (vs) {
    case "zenself": return "self"
    case "vsother": return "other"
    default: return "computer"
  }
}
const gameModeStat = (vs) => {
  if (vs === "vsother") {
    return "other"
  } else if (vs.startsWith("zen")) {
    return "zen"
  } else {
    return "computer"
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
      break
    }
  }
}

const initMaze = () => {
  view.scrollToGame()

  const loadStats = localStorage.getItem('stats')
  if (loadStats){
    game.stats = JSON.parse(loadStats)
  }

  view.mazeBlank().finished.then(()=>{
    initMazeRandom()
    view.drawGame(game).finished.then(()=>{
      view.mazeAppear()
    })
  })
}


const playerClick = (move) => {
  console.debug("click human", move)
  view.boxClick(move)

  const movesValid = getMoves(game.pos,game.maze)

  if ( ! ["human","other"].includes(game.turn) ) {
    console.warn("Not your turn")
  }

  if(["human","other"].includes(game.turn) && movesValid.includes(move)){
    game.moves.push(move)
    game.maze = makeMove(move,game.maze)

    game.pos = move

    const movesValidNext = getMoves(game.pos,game.maze)
    for (let moveValidNext of movesValidNext) {
      view.boxClick(moveValidNext)
    }
    // GAME OVER
    if (movesValidNext.length == 0) {

      const winScore = (game.moves.length-1)
      switch (gameMode(game.vs)) {
        case "zen":
          game.stats[game.vs].score += winScore
          game.stats[game.vs].scores.push(winScore)
          break;
        case "vs":
          switch (game.turn) {
            case "human":
              game.stats[game.vs].youscore += winScore
              game.stats[game.vs].scores.push({win:"self", score:winScore})
              break;
            case "other":
              game.stats[game.vs].otherscore += winScore
              game.stats[game.vs].scores.push({win:"other", score:winScore})
              break;
          }
          break;
      }



      localStorage.setItem("stats", JSON.stringify(game.stats))
      console.log("Win "+game.turn+": " + winScore)

      view.drawGame(game).finished.then(()=>{
        view.mazeDisappear(game.moves).finished.then(()=>{
          if (game.vs === "vsother"){
            game.turn = game.turn === "other" ? "human" : "other"
          } else {
            game.turn = "human"
          }
          initMaze()
        })
      })
    } else {
      switch (gameVSMode(game.vs)) {
        case "computer":
          game.turn = "computer"
          view.aiThink(game.pos,game.maze).finished.then(function(){
            aiClick(game.ai(game.pos,game.maze))
          })
          break
        case "self":
          break
        case "other":
          game.turn = game.turn === "other" ? "human" : "other"
          break
        default:
          throw ("gameVSMode invalid: " + gameVSMode(game.vs) + " from "+ game.vs)
      }
      view.drawGame(game)
    }
  }
}

const playerClickCheck = (move) => {
  view.boxClick(move)
  const movesValid = getMoves(game.pos,game.maze)
      const movesValidNext = getMoves(move,game.maze)
      for (let moveValidNext of movesValidNext) {
        view.boxClick(moveValidNext)
      }
}



const aiClick = (move) => {
  if (game.turn != "computer") {
    throw ("Not AI's turn")
  }

  console.debug("click computer", move)
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
      const winScore = (game.moves.length-1)
      switch (gameMode(game.vs)) {
        case "zen":
          game.stats[game.vs].score += winScore
          game.stats[game.vs].scores.push(winScore)
          break;
        case "vs":
          game.stats[game.vs].otherscore += winScore
          game.stats[game.vs].scores.push({win:"computer", score:winScore})
          break;
      }

      localStorage.setItem("stats", JSON.stringify(game.stats))
      console.log("Win CPU: " + winScore)

      view.drawGame(game).finished.then(()=>{
        view.mazeDisappear(game.moves).finished.then(()=>{
          game.turn = "human"
          initMaze()
        })
      })
    } else {
      switch (gameVSMode(game.vs)) {
        case "computer":
          game.turn = "human"
          break
        default:
          throw ("gameVSMode invalid: " + gameVSMode(game.vs) + " from "+ game.vs)
      }
      view.drawGame(game)
    }
  }
}


const clickReset = () => {
  view.scrollToGame()

  switch (gameMode(game.vs)) {
    case "zen":
      game.stats[game.vs] = {
            score: 0,
            scores: [],
          }
      break;
    case "vs":
      game.stats[game.vs] = {
        youscore: 0,
        otherscore: 0,
        scores: [],
      }
      break;
  }

  localStorage.setItem("stats", JSON.stringify(game.stats))

  initMaze()
}

const clickHelp = () => {
  if (game.showHelp){
    game.showHelp = false;
    document.getElementById("help").style.display = "none"
    document.getElementById("maze").style.display = ""
    document.getElementById('helpButton').classList.remove("active")
  } else {
    view.scrollToGame()
    game.showHelp = true;
    document.getElementById("help").style.display = ""
    document.getElementById("maze").style.display = "none"
    document.getElementById('helpButton').classList.add("active")
  }
}





const setVSAI = (ai_name) => {
  game.ai = ai[ai_name]
  game.vs = ai_name
  localStorage.setItem("vs", JSON.stringify(game.vs))
  view.scrollToGame()
  initMaze()
}

const setVSSelf = () => {
  game.ai = null
  game.vs = "zenself"
  localStorage.setItem("vs", JSON.stringify(game.vs))
  view.scrollToGame()
  initMaze()
}
const setVSOther = () => {
  game.ai = null
  game.vs = "vsother"
  localStorage.setItem("vs", JSON.stringify(game.vs))
  view.scrollToGame()
  initMaze()
}



const initMazeHTML = () => {
  const mazeEl = document.getElementById("maze")
  for (let yx = 0; yx < 100; yx++) {
    const boxDiv = document.createElement('div')
    mazeEl.appendChild(boxDiv)
    boxDiv.id = 'box' + yx
    boxDiv.className = 'box'
    boxDiv.onclick = (()=>playerClick(yx))
    boxDiv.onmousedown = (()=>playerClickCheck(yx))
  }

  document.documentElement.style.setProperty("--color-nothing", colors.nothing)
  document.documentElement.style.setProperty("--color-text", colors.startPos)
  document.documentElement.style.setProperty("--color-border", colors.playerPos)
  game.turn = "human"

  const loadVS = localStorage.getItem('vs')
  if (loadVS){
    game.vs = JSON.parse(loadVS)
  }

  initMaze()
}


console.log("🐴")
