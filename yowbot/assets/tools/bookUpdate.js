// this is the beginning of a script that fixes OBK books from Chessmaster
// 11 so they work with obk2bin.exe (see tools folder). Some of the Books
// in CM11 are not compatible with obk2bin.exe. They can (theoretically)
// be fixed by replaceing the code at the beginnigg of the binary
// this script does that. This was orginally done by just resaving the books
// in Chessmaster itself as custom books which fixed the issue, however, 
// if a script is built we should be able to build all teh book bin assets
// automatically without having to store any of the CM assets in the repo
// that is the evetual goal of this script

const fs = require('fs')

const replacementBytes = new TextEncoder().encode('BOO!')

fs.open("Bipto.obk", "r+", (err, fd) => {
  if(!err) {
    fs.write(fd, replacementBytes, 0, 4, 0, (err, bw, buf) => {
      if(!err) {
          // succesfully wrote byte to offset
      }
    });
  }
});