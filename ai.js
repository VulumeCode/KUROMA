// public instance
function ai() {}


ai.zendrunk = (pos,maze) => {
  const movesValid = getMoves(pos,maze)
  movesValid.shuffle()
  for (const move of movesValid) {
    const newMaze = makeMove(move, maze)
    const moveScore =getMoves(move,newMaze).length
    if (moveScore > 0){
      console.debug("🐴blep")
      return move
    }
  }
  console.debug("🐴guess we'll die")
  return movesValid[0]
}



ai.vssamurai = (pos,maze) => {
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

ai.vsronin = (pos,maze) => {
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

ai.vsninja = (pos,maze) => {
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


ai.zenmonk = (pos,maze) => {
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





ai.zenmaster = (pos,maze) => {
  const depth = 10
  let bestMove = null // higher is better, not competetive
  let bestMoveScore = -666
  const movesValid = getMoves(pos,maze)
  movesValid.shuffle()
  for (const move of movesValid) {
    const newMaze = makeMove(move, maze)
    const moveScore = estimaxi(newMaze, move, depth)
    // console.log(moveScore + "---------------------")
    console.debug("🐴"+move+" : "+moveScore)
    if (moveScore > bestMoveScore){
      bestMove = move
      bestMoveScore = moveScore
    }
  }
  return bestMove
}


const estimaxi = (maze, yx, n) => {
  return esti(maze, yx, n)
}
const esti = (maze, yx, n) => {
  const reachable = getMoves(yx,maze)
  if (reachable.length == 0) {
    // console.log(">".repeat(1+n) + 0)
    return 0
  }
  if (n<=0) {
    // console.log(">".repeat(1+n) + (reachable.length))
    return 1
  }
  let totalMoveScore = 0
  for (let move of reachable) {
    const newMaze = makeMove(move, maze)
    const moveScore = maxi(newMaze, move, n-1)
    totalMoveScore += moveScore
  }
  // console.log(">".repeat(1+n) + (bestMoveScore + 1))
  return (totalMoveScore/reachable.length) + 1
}
const maxi = (maze, yx, n) => {
  const reachable = getMoves(yx,maze)
  if (reachable.length == 0) {
    // console.log(">".repeat(1+n) + 0)
    return 0
  }
  // if (n==0) {
  //   // console.log(">".repeat(1+n) + (reachable.length))
  //   return 1
  // }
  let bestMoveScore = -666
  for (let move of reachable) {
    const newMaze = makeMove(move, maze)
    const moveScore = esti(newMaze, move, n-1)
      if (moveScore>bestMoveScore) {
      bestMoveScore = moveScore
    }
  }
  // console.log(">".repeat(1+n) + (bestMoveScore + 1))
  return bestMoveScore + 1
}
