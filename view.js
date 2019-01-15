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
view.mazeAppear = (yx) => {
  const boxes = document.getElementsByClassName("box");
  anime({
    targets: boxes,
    scale: [0, 1],
    duration: 100,
    easing: 'linear',
    // delay: anime.stagger(20, {
    //   grid: [10, 10],
    //   from: 'center'
    // }),
    delay: function(el, yx) {
      const [y,x] = yxsplit(yx);
      const offset = Math.abs(x-5);
      return offset * 40;
    },
  });
}

view.drawMaze = (maze,startPos,pos,movesDone) => {
  const movesValid = getMoves(pos,maze);
  for (var yx = 0; yx < 100; yx++) {
      const box = document.getElementById(yx)
      let color = null;
      if (movesValid.includes(yx)) {
        color = colors.validMove;
      } else if (maze[yx]) {
        color = colors.open;
      } else if (pos == yx) {
        color = colors.player;
      } else if (startPos == yx) {
        color = colors.start;
      } else if (movesDone.includes(yx)) {
        color = colors.moveDone;
      } else {
        color = colors.nothing;
      };
      anime({
        targets: box,
        backgroundColor: color,
        duration: 200,
        easing: 'linear',
      });
  };
}
