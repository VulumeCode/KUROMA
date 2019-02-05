// public instance
function view() {}

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
    loop: Math.min(2,movesValid.length),
    easing: 'linear',
    delay: 200,
  })
}

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
view.mazeBlank = () => {
  return anime({
    targets: ".box",
    opacity: 0,
    duration: 0,
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
  view.drawMenu(gameState.vs, gameState.showHelp)
  view.drawStats(gameState)
  return view.drawMaze(gameState.maze, gameState.startPos, gameState.pos, gameState.moves, gameState.turn)
}

view.drawMenu = (vs, showHelp) => {
  document.querySelectorAll(".aiButton").forEach(x=>x.classList.remove("active"))
  document.getElementById(vs).classList.add("active")

  document.querySelectorAll(".aiCategory").forEach(x=>x.classList.remove("active"))
  document.getElementById(gameMode(vs)).classList.add("active")
}



view.drawStats = (gameState) => {
  document.querySelectorAll(".stats").forEach(x=>x.style.display="none")
  document.getElementById(gameModeStat(gameState.vs)+"stats").style.display=""


  const scoreGameBannerElem = document.getElementById(gameModeStat(gameState.vs)+"GameBanner")
  switch (gameState.turn) {
    case "human":
      scoreGameBannerElem.style.color = colors.humanPos; break;
    case "computer":
      scoreGameBannerElem.style.color = colors.computerPos; break;
    case "other":
      scoreGameBannerElem.style.color = colors.computerPos; break;
    default:
      scoreGameBannerElem.style.color = "##ff00ff"; break;
  }

  const scoreGameElem = document.getElementById(gameModeStat(gameState.vs)+"ScoreGame")
  scoreGameElem.textContent = Math.max(0,gameState.moves.length-1)

  switch (gameModeStat(gameState.vs)) {
    case "zen": {
      const scoreZENElem = document.getElementById("scoreZEN")
      scoreZENElem.textContent = gameState.stats[gameState.vs].score
      const gamesZENElem = document.getElementById("gamesZEN")
      gamesZENElem.textContent = gameState.stats[gameState.vs].scores.length
      const maxZENElem = document.getElementById("maxZEN")
      maxZENElem.textContent = Math.max(0, ...gameState.stats[gameState.vs].scores)
      const gradeZENElem = document.getElementById("gradeZEN")
      gradeZENElem.textContent = getGradeZEN(gameState.stats[gameState.vs].scores)
      break;
    }
    case "computer": {
      const scoreYOUElem = document.getElementById("scoreYOUcomputer")
      scoreYOUElem.textContent = gameState.stats[gameState.vs].youscore
      const winsYOUElem = document.getElementById("winsYOUcomputer")
      winsYOUElem.textContent = gameState.stats[gameState.vs].scores.filter(x=>x.win="self").length
      const maxYOUElem = document.getElementById("maxYOUcomputer")
      maxYOUElem.textContent = Math.max(0, ...gameState.stats[gameState.vs].scores
                                                    .filter(x=>x.win="self").map(x=>x.score))
      const scoreCPUElem = document.getElementById("scoreCPUcomputer")
      scoreCPUElem.textContent = gameState.stats[gameState.vs].otherscore
      const winsCPUElem = document.getElementById("winsCPUcomputer")
      winsCPUElem.textContent = gameState.stats[gameState.vs].scores.filter(x=>x.win="computer").length
      const maxCPUElem = document.getElementById("maxCPUcomputer")
      maxCPUElem.textContent = Math.max(0, ...gameState.stats[gameState.vs].scores
                                                    .filter(x=>x.win="computer").map(x=>x.score))
      const gradeVSElem = document.getElementById("gradeVS")
      gradeVSElem.textContent = getGradeVS(gameState.stats[gameState.vs].scores)
      break;
    }
    case "other": {
      const scoreYOUElem = document.getElementById("scoreYOUother")
      scoreYOUElem.textContent = gameState.stats[gameState.vs].youscore
      const winsYOUElem = document.getElementById("winsYOUother")
      winsYOUElem.textContent = gameState.stats[gameState.vs].scores.filter(x=>x.win="self").length
      const maxYOUElem = document.getElementById("maxYOUother")
      maxYOUElem.textContent = Math.max(0, ...gameState.stats[gameState.vs].scores
                                                    .filter(x=>x.win="self").map(x=>x.score))
      const scoreOTHERElem = document.getElementById("scoreOTHERother")
      scoreOTHERElem.textContent = gameState.stats[gameState.vs].otherscore
      const winsOTHERElem = document.getElementById("winsOTHERother")
      winsOTHERElem.textContent = gameState.stats[gameState.vs].scores.filter(x=>x.win="other").length
      const maxOTHERElem = document.getElementById("maxOTHERother")
      maxOTHERElem.textContent = Math.max(0, ...gameState.stats[gameState.vs].scores
                                                    .filter(x=>x.win="other").map(x=>x.score))
      const totalotherElem = document.getElementById("totalother")
      totalotherElem.textContent = gameState.stats[gameState.vs].scores
                                                    .reduce((a, b) => a.score + b.score, 0)
      break;
    }
  }
}

const getGradeZEN = (scores) => {
  return getGrade(scores)
}
const getGradeVS = (scores) => {
  return getGrade(scores.slice(-5).map((s=>{
    s.win === "self"
      ? Math.max(20,s.score)
      : Math.min(20,s.score)
  })))
}

const getGrade = (scores) => {
  const recentStats = [20,20,20,20,20,...scores].slice(-5)

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
  if ((document.fullScreenElement && document.fullScreenElement !== null) ||
   (!document.mozFullScreen && !document.webkitIsFullScreen)) {
    if (document.documentElement.requestFullScreen) {
      document.documentElement.requestFullScreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullScreen) {
      document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.cancelFullScreen) {
      document.cancelFullScreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen();
    }
  }
}

view.scrollToGame = () => {
  let elem = document.querySelector("#game")
  elem.scrollIntoView();
}
