// Thes are engine commands I removed since they didn't seem necessary
// keeping them here for reference for now though
// child.stdin.write('black\n')
// child.stdin.write('white\n')
// set up the clock time
// const clockTime='0 12:40 0'
// const moveTime='80000'
// const clockTime='0 3:20 0'
// const moveTime='20000'
// const clockTime='0 0:01 0'
// const moveTime='5000'
// child.stdin.write('new\n')
// child.stdin.write(`level ${clockTime}\n`)
// child.stdin.write('cm_parm opk=150308\n')
// prepare to take move list
// child.stdin.write('force\n')

  // set time control
  // child.stdin.write(`level 0 0 5\n`)
  // const clockTime='0 3:20 0'
  // child.stdin.write(`level ${clockTime}\n`)


// function complexManualCoridnateParsing(algebraMove, moves) {
    // // chess js didn't like the move let's try a more manual approach
  // let disambiguation 
  // let disambigCordinate
  
  // // first let's check for full disambiguation, if it exist just return it as
  // // the move (ex. Qe4e5)
  // if (disambiguation = algebraMove.match(/[a-h][1-8][a-h][1-8]/)) {
  //   return disambiguation[0]
  // }
  
  // // next check for a single disambiguation cordinate, if so save it (ex. Qea1)
  // if (disambiguation = algebraMove.match(/([a-h|1-8])[a-h][1-8]/)) {
  //   disambigCordinate = disambiguation[1]
  // }

  // //todo translate promotion move

  // let toSquare = algebraMove.match(/[a-h][0-8]/)[0]
  // let piece = algebraMove.match(/[KQBNR]/)[0]


  // for (const square of chess.chess.SQUARES) {
  //   // is this the type of piece we're looking for? if not move along
  //   const boardPiece = chess.chess.get(square)
  //   if (!boardPiece) continue
  //   if (boardPiece.type !== piece.toLowerCase()) continue

  //   // now we have a candidate move
  //   let testMove = square + toSquare
  //   console.log(testMove)

  //   // if chessjs still doesn't like it move along
  //   let longMove = chess.chess.move(testMove)
  //   if (!longMove) continue

  //   // if there's a diabiguation cordinate make sure this is the right square
  //   // to move from (it should contain the cordinate) if not move on
  //   if (disambigCordinate && !square.includes(disambigCordinate)) continue 

    
  //   // we found our move we can stop searching for it
  //   cordinateMove = testMove
  //   break
  // }

  
  // // at this point if we never found a move we will be returning null
  // if (cordinateMove === null) {
  //   console.error('Failed to create cordinate move!')
  // }
  // return cordinateMove
// } 