// public instance
function view() {}

const colors = {
  validMove: "#fc9867",
  open: "#454046",
  player: "#ffd866",
  start: "#ff6188",
  moveDone: "#ff6188",
  nothing: "#2c292d",
}



view.boxClick = (yx) => {
  const box = document.getElementById(yx);
  anime({
    targets: box,
    scale: [0.85, 1],
    duration: 200,
    easing: 'linear',
  });
}

view.boxAppear = (yx) => {
  const box = document.getElementById(yx);
  anime({
    targets: box,
    scale: [0, 1],
    duration: 200,
    easing: 'linear',
    direction: 'reverse',
  });
}
view.mazeAppear = () => {
  const boxes = document.getElementsByClassName("box");
  return anime({
    targets: boxes,
    scale: [0, 1],
    duration: 100,
    easing: 'linear',
    delay: function(el, yx) {
      const [y, x] = yxsplit(yx);
      const offset = (x<5?4-x:x-5);
      return offset * 40;
    },
  });
}
view.mazeDisappear = () => {
  const boxes = document.getElementsByClassName("box");
  return anime({
    targets: boxes,
    scale: [1,0],
    color: colors.nothing,
    duration: 100,
    easing: 'linear',
    delay: function(el, yx) {
      const [y, x] = yxsplit(yx);
      const offset = (x<5?x:9-x);
      return offset * 40;
    },
  });
}



view.drawMaze = (maze, startPos, pos, movesDone) => {
  const movesValid = getMoves(pos, maze);
  const getColor = (yx) => {
    if (movesValid.includes(yx)) {
      return colors.validMove;
    } else if (maze[yx]) {
      return colors.open;
    } else if (pos == yx) {
      return colors.player;
    } else if (startPos == yx) {
      return colors.start;
    } else if (movesDone.includes(yx)) {
      return colors.moveDone;
    } else {
      return colors.nothing;
    };
  }
  const boxes = document.getElementsByClassName("box");

  return anime({
    targets: boxes,
    backgroundColor: function(el, yx) {
      return getColor(yx);
    },
    duration: 200,
    easing: 'linear',
  });
}




view.drawGame = (gameState) => {
  view.drawStats(gameState)
  return view.drawMaze(gameState.maze, gameState.startPos, gameState.pos, gameState.moves)
}

view.drawStats = (gameState) => {
  const scoreElem = document.getElementById("score");
  scoreElem.textContent = "Score\xa0\xa0\xa0" + (gameState.moves.length + 1) + "p";

  const maxElem = document.getElementById("max");
  maxElem.textContent = "Max\xa0\xa0\xa0" + Math.max(0, ...gameState.stats) + "p";

  const gamesElem = document.getElementById("games");
  gamesElem.textContent = "Games\xa0\xa0\xa0" + gameState.stats.length;

  const rankElem = document.getElementById("rank");
  const recentStats = gameState.stats.slice(-3);
  rankElem.textContent = "Rank\xa0\xa0\xa0#" + Math.floor(100 - (100 * ((recentStats.reduce((a, b) => a + b, 0) / (40 * recentStats.length)) || 0)));
}
