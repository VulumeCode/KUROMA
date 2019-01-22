// public instance
function ai() {}

ai.leastmoves = (pos,maze) => {
  let bestMove = null // lower is better, 0 is best
  let bestMoveScore = 666
  const movesValid = getMoves(pos,maze)
  movesValid.shuffle()
  for (const move of movesValid) {
    const newMaze = makeMove(move, maze)
    const moveScore =getMoves(move,newMaze).length
    if (moveScore === 0){
      console.debug("🐴kill")
      return move
    }
    if (moveScore < bestMoveScore){
      bestMove = move
      bestMoveScore = moveScore
    }
  }
  return bestMove
}

ai.killormostmoves = (pos,maze) => {
  let bestMove = null // higher is better, 0 is best
  let bestMoveScore = -666
  const movesValid = getMoves(pos,maze)
  movesValid.shuffle()
  for (const move of movesValid) {
    const newMaze = makeMove(move, maze)
    const moveScore =getMoves(move,newMaze).length
    if (moveScore === 0){
      console.debug("🐴kill")
      return move
    }
    if (moveScore > bestMoveScore){
      bestMove = move
      bestMoveScore = moveScore
    }
  }
  return bestMove
}

ai.killorsurvive = (pos,maze) => {
  let bestMove = null // best move is last move where you don't die, or when you can kill
  const mymovesValid = getMoves(pos,maze)
  mymovesValid.shuffle()
  for (const mymove of mymovesValid) {
    const theirnewMaze = makeMove(mymove, maze)
    const theirmovesValid =getMoves(mymove,theirnewMaze)
    if (theirmovesValid.length === 0){
      console.debug("🐴kill")
      return mymove
    }

    console.debug("🐴survive if i go here? " + mymove )
    let goodMove = true
    for (const theirmove of theirmovesValid) {
      const mynewMaze = makeMove(theirmove, theirnewMaze)
      const mynewmovesValid = getMoves(theirmove, mynewMaze)
      if (mynewmovesValid.length === 0){
        goodMove = false
        break
      }
    }

    if (goodMove){
      console.debug("🐴yeah sure")
      bestMove = mymove
    } else {
      console.debug("🐴i'd die :o")
    }
  }
  if (bestMove == null){
    console.debug("🐴guess i'll die :(")
    return mymovesValid[0]
  } else {
    console.debug("🐴i'll live")
    return bestMove
  }

}


ai.zen = (pos,maze) => {
  const depth = Math.randomIntBetween(8,10)
  let bestMove = null // higher is better, not competetive
  let bestMoveScore = -666
  const movesValid = getMoves(pos,maze)
  movesValid.shuffle()
  for (const move of movesValid) {
    const newMaze = makeMove(move, maze)
    const moveScore = reachableNdepth_zen(newMaze, move, depth)
    // console.log(moveScore + "---------------------")
    if (moveScore > bestMoveScore){
      bestMove = move
      bestMoveScore = moveScore
    }
  }
  if (bestMoveScore > depth){
    console.debug("🐴 explore: pos"+bestMove+", score:"+bestMoveScore)
  }else{
    console.debug("🐴 the end is neigh: pos"+bestMove+", score:"+bestMoveScore+" left...")
  }
  return bestMove
}



const reachableNdepth_zen = (maze, yx, n) => {
  const reachable = getMoves(yx,maze)
  if (reachable.length == 0) {
    // console.log(">".repeat(1+n) + 0)
    return 0
  }
  if (n==0) {
    // console.log(">".repeat(1+n) + (reachable.length))
    return reachable.length
  }
  let bestMoveScore = -666
  for (let move of reachable) {
    const newMaze = makeMove(move, maze)
    const r = reachableNdepth_zen(newMaze, move, n-1)
    if (r>bestMoveScore) {
      bestMoveScore = r
    }
  }
  // console.log(">".repeat(1+n) + (bestMoveScore + 1))
  return bestMoveScore + 1
}







const nn = () => {
  var iteration = 0;
  const strMove = (a,b) => {
    if (a<b) {
      return String(a).padStart(2, "0") + String(b).padStart(2, "0")
    } else {
      return String(b).padStart(2, "0") + String(a).padStart(2, "0")
    }
  }

  const printMoves = (neurons) => {
    // console.log(neurons)
    const valids = []
    for (const n in neurons) {
      if (!! neurons[n]) {
        valids.push(n)
      }
    }
    valids.sort()
    console.log(valids)

  }

  const maze = [
    1,1,1,1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,1,1,1,
  ].map(x=>!!x)
  const G = {}
  const U0 = {}
  const V0 = {}
  for (const yx of _.range(100)) {
    const moves = getMoves(yx,maze)
    for (const move of moves) {
      if (yx < move) {
        const newMaze = maze.clone()
        newMaze[yx] = false
        newMaze[move] = false
        const movesto = getMoves(yx, newMaze).map(x=>strMove(x,yx))
        const movesfrom = getMoves(move, newMaze).map(x=>strMove(x,move))
        G[strMove(yx,move)] = [...movesto,...movesfrom]
        U0[strMove(yx,move)] = 0
        V0[strMove(yx,move)] = 0
      }
    }
  }

  let Ut = U0
  let Vt = V0
  let Utn = {}
  let Vtn = {}
  while (true) {
    for (const move in G) {
      Utn[move] = Ut[move] + 4 - G[move].map(x=>Vt[x]).reduce((a,b)=>a+b,0)
      if (Utn[move] > 3){
        Vtn[move] = 1
      } else if (Utn[move] < 0){
        Vtn[move] = 0
      } else {
        Vtn[move] = Vt[move]
      }
    }


    if (iteration > 100 && _.isEqual(Vt, Vtn)){
      console.log(iteration,printMoves(Vt))
      break
    }

    Ut = Utn
    Vt = Vtn
    Utn = {}
    Vtn = {}
    iteration += 1
  }
  // console.log(iteration,Ut)

}
