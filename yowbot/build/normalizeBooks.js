//Some of the Books in CM11 are not compatible with obk2bin.exe (see tools). 
// They can be fixed by replaceing the code at the beginnigg of the binary
// this script does that. 

const fs = require('fs')

const books = ["FischerR.obk", "AlekhineA.obk", "BotvinnikM.obk", "Depth4.obk", "FastLose.obk", "IvanchukV.OBK", "KramnikV.OBK", "MentorFrench.obk", "OldBook.obk", "ReshevskyS.obk", "SmyslovV.obk", "TimmanJ.obk", "AnandV.obk", "CMX.obk", "Depth6.obk", "FineR.obk", "KamskyG.obk", "LarsenB.obk", "MentorGerman.OBK", "PaulsenL.OBK", "RetiR.obk", "SpasskyB.obk", "Trappee.obk", "AnderssenA.obk", "CapablancaJR.obk", "Drawish.obk", "KarpovA.obk", "LaskerE.obk", "Merlin.obk", "PawnMoves.obk", "RubinsteinA.obk", "SteinitzW.obk", "Trapper.obk", "Bipto.obk", "CaptureBook.obk", "EarlyQueen.obk", "KashdanI.OBK", "LekoP.OBK", "MorphyP.obk", "PetrosianT.obk", "SeirawanY.obk", "Strong.obk", "Unorthodox.obk", "BirdH.obk", "ChigorinM.OBK", "EuweM.obk", "FlohrS.obk", "KeresP.obk", "LowCaptureBook.obk", "NajdorfM.OBK", "PillsburyH.obk", "ShirovA.obk", "TalM.obk", "WaitzkinJ.obk", "BlackburneJ.obk", "DangerDon.obk", "EvansL.obk", "Gambit.obk", "KnightMoves.obk", "MarshallF.obk", "NimzowitschA.obk", "PolgarJ.obk", "ShortN.obk", "TarraschS.obk", "Weak.obk", "BogoljubowE.obk", "Depth2.obk", "FastBook.obk", "GellerE.OBK", "KorchnoiV.obk", "Mentor.OBK", "NoBook.obk", "Reference.OBK", "SlowBook.obk", "TartakowerS.OBK", "ZukertortJ.OBK"]

// const books = ["Depth4.obk", "FastLose.obk", "IvanchukV.OBK", "KramnikV.OBK", "MentorFrench.obk", "Bipto.obk"]
const replacementBytes = new TextEncoder().encode('BOO!')

console.log(`Attempting to normalize ${books.length} books`)

for (const book of books) {
  fs.open(book, "r+", (err, fd) => {
    if(!err) {
      fs.write(fd, replacementBytes, 0, 4, 0, (err, bw, buf) => {
        if(!err) {
            console.log(`Success normalizing ${book}`)
        } else {
            console.log(`Failed to normalizing ${book}`)
        }
      });
    } else {
      console.log(`Error with book ${book}`)
    }
  });
}