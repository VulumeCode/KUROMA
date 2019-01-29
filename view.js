// public instance
function view() {}

// const colors = {
//   validMove: "#fc9867",
//   open: "#454046",
//   playerPos: "#ffd866",
//   startPos: "#ff6188",
//   moveDone: "#ff6188",
//   nothing: "#2c292d",
//   background: "#2c292d",
// }
const colors = {
  // base16 materialtheme
  validMove: "#676E95",
  open: "#32374D",
  playerPos: "#89DDFF",
  humanPos: "#89DDFF",
  computerPos: "#C3E88D",
  playerPosDeath: "#FF5370",
  startPos: "#FF5370",
  moveDone: "#FF5370",
  nothing: "#292D3E",
  background: "#292D3E",
}



view.boxClick = (yx) => {
  anime({
    targets: "#box" + yx ,
    scale: [0.85, 1],
    duration: 200,
    easing: 'easeOutQuad',
  })
}
view.aiThink = (pos,maze) => {
  const movesValid = getMoves(pos, maze)
  return anime({
    targets: movesValid.map((yx)=>"#box" + yx) ,
    backgroundColor: [
        {value:colors.validMove, duration: 0},
        {value:colors.computerPos, duration:100},
        {value:colors.validMove, duration: 100},
    ],
    loop: Math.min(3,movesValid.length),
    easing: 'linear',
    delay: 200,
  })
  // return anime({
  //   targets: movesValid.map((yx)=>"#box" + yx) ,
  //   scale: [
  //     {value:1, duration: 0},
  //     {value:0.85, duration:0},
  //     {value:1, duration: 200},
  //   ],
  //   backgroundColor: [
  //       {value:colors.validMove, duration: 0},
  //       {value:colors.computerPos, duration:100},
  //       {value:colors.validMove, duration: 100},
  //   ],
  //   easing: 'easeOutQuad',
  //   delay: anime.stagger(180, {start: 200}),
  // })
}
// view.boxMouseDown = (yx) => {
//   anime({
//     targets: "#box" + yx ,
//     scale: [1, 0.85],
//     duration: 100,
//     easing: 'easeOutQuad',
//   })
// }
// view.boxMouseUp = (yx) => {
//   anime({
//     targets: "#box" + yx ,
//     scale: [0.85, 1],
//     duration: 100,
//     easing: 'easeOutQuad',
//   })
// }

view.boxAppear = (yx) => {
  anime({
    targets: "#box"+yx,
    scale: [0, 1],
    duration: 200,
    easing: 'easeOutQuad',
    direction: 'reverse',
  })
}
view.mazeAppear = () => {
  return anime({
    targets: ".box",
    scale: [0, 1],
    opacity: 1,
    duration: 100,
    easing: 'easeOutQuad',
    delay: function(el, yx) {
      const [y, x] = yxsplit(yx)
      const offset = (x<5?4-x:x-5)
      return offset * 40
    },
  })
}
view.mazeDisappear = (movesDone) => {
  return anime({
    targets: ".box",
    scale: [1,0],
    opacity: 0,
    duration: 1000,
    easing: 'easeOutQuad',
    delay: function(el, yx) {
      movesDone = movesDone || []
      const movesidx = movesDone.indexOf(yx)
      if (movesidx>=0) {
        return 500+ movesidx*100
      }else{
        const [y, x] = yxsplit(yx)
        const offset = (x<5?x:9-x)
        return 500+ (movesDone.length+1)*100 + offset * 60
      }
    },
  })
}



view.drawMaze = (maze, startPos, pos, movesDone, turn) => {
  movesDone = movesDone || []

  const movesValid = getMoves(pos, maze)
  const getColor = (yx) => {
    if (movesValid.includes(yx)) {
      return colors.validMove
    } else if (maze[yx]) {
      return colors.open
    } else if (pos == yx) {
      // if (movesValid.length > 0){
      if (true){
        switch (turn) {
          case "human":
            return colors.humanPos
          case "computer":
            return colors.computerPos
          case "other":
            return colors.computerPos
          default:
            return "##ff00ff"
        }
      } else {
        return colors.playerPosDeath
      }
    } else if (startPos == yx) {
      return colors.startPos
    } else if (movesDone.includes(yx)) {
      return colors.moveDone
    } else {
      return colors.nothing
    }
  }
  const boxes = document.getElementsByClassName("box")

  return anime({
    targets: boxes,
    backgroundColor: function(el, yx) {
      return getColor(yx)
    },
    duration: 200,
    easing: 'easeOutQuad',
  })
}




view.drawGame = (gameState) => {
  view.drawStats(gameState)
  return view.drawMaze(gameState.maze, gameState.startPos, gameState.pos, gameState.moves, gameState.turn)
}

view.drawStats = (gameState) => {
  const scoreGameElem = document.getElementById("scoreGame")
  const scoreCPUElem = document.getElementById("scoreCPU")
  const scoreYOUElem = document.getElementById("scoreYOU")
  scoreCPUElem.textContent = gameState.statsComputer
  scoreGameElem.textContent = Math.max(0,gameState.moves.length-1)
  scoreYOUElem.textContent = gameState.statsHuman


  const maxElem = document.getElementById("max")
  maxElem.textContent = Math.max(0, ...gameState.stats)

  const gamesElem = document.getElementById("games")
  gamesElem.textContent = gameState.stats.length

  const rankElem = document.getElementById("rank")
  // const recentStats = gameState.stats.slice(-5)
  // rankElem.textContent = "Rank\xa0\xa0\xa0::\xa0\xa0\xa0#" + Math.floor(100 - (100 * ((recentStats.reduce((a, b) => a + b, 0) / (40 * recentStats.length)) || 0)))
  rankElem.textContent = getRank(game.stats)
}

const getRank = (stats) => {
  const recentStats = stats.slice(-5)

  const avg = ((recentStats.reduce((a, b) => a + b, 0) / (recentStats.length)) || 0)

  // console.log("avg: ",avg)

  if (recentStats.slice(-3).filter((x)=>x>=30).length===3){
    return "SSS"
  }
  if (recentStats.slice(-2).filter((x)=>x>=30).length===2){
    return "SS"
  }
  if (avg >= 25 || recentStats.slice(-1).filter((x)=>x>=30).length===1){
    return "S"
  }
  if (avg >= 20 && recentStats.filter((x)=>x>=25).length>=1){
    return "A+"
  }
  if (avg >= 20){
    return "A"
  }
  if (avg >= 19){
    return "A-"
  }
  if (avg >= 15 && recentStats.filter((x)=>x>=20).length>=1){
    return "B+"
  }
  if (avg >= 15){
    return "B"
  }
  if (avg >= 14){
    return "B-"
  }
  if (avg >= 5 && recentStats.filter((x)=>x>=15).length>=1){
    return "C+"
  }
  if (avg >= 5){
    return "C"
  }
  if (avg >= 4){
    return "C-"
  }
  if (avg >= 1 && recentStats.filter((x)=>x>=5).length>=1){
    return "D+"
  }
  if (avg >= 1){
    return "D"
  }
  if (avg >= 0){
    return "D-"
  }



}

view.enterFullscreen = () => {
  let elem = document.querySelector(":root")
  if (elem.webkitRequestFullScreen) {
    elem.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT)
  } else {
    elem.mozRequestFullScreen()
  }
}

view.scrollToGame = () => {
  let elem = document.querySelector("#header")
  elem.scrollIntoView();
}
