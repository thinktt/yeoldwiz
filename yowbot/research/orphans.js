const starters = ["AlekhineA.bin", "AnandV.bin", "AnderssenA.bin", "Bipto.bin", "BirdH.bin", "BlackburneJ.bin", "BogoljubowE.bin", "BotvinnikM.bin", "CMX.bin", "CapablancaJR.bin", "CaptureBook.bin", "ChigorinM.bin", "DangerDon.bin", "Depth2.bin", "Depth4.bin", "Depth6.bin", "Drawish.bin", "EarlyQueen.bin", "EuweM.bin", "EvansL.bin", "FastBook.bin", "FastLose.bin", "FineR.bin", "FischerR.bin", "FlohrS.bin", "Gambit.bin", "GellerE.bin", "IvanchukV.bin", "KamskyG.bin", "KarpovA.bin", "KashdanI.bin", "KeresP.bin", "KnightMoves.bin", "KorchnoiV.bin", "KramnikV.bin", "LarsenB.bin", "LaskerE.bin", "LekoP.bin", "LowCaptureBook.bin", "MarshallF.bin", "Mentor.bin", "MentorFrench.bin", "MentorGerman.bin", "Merlin.bin", "MorphyP.bin", "NajdorfM.bin", "NimzowitschA.bin", "NoBook.bin", "OldBook.bin", "PaulsenL.bin", "PawnMoves.bin", "PetrosianT.bin", "PillsburyH.bin", "PolgarJ.bin", "Reference.bin", "ReshevskyS.bin", "RetiR.bin", "RubinsteinA.bin", "SeirawanY.bin", "ShirovA.bin", "ShortN.bin", "SlowBook.bin", "SmyslovV.bin", "SpasskyB.bin", "SteinitzW.bin", "Strong.bin", "TalM.bin", "TarraschS.bin", "TartakowerS.bin", "TimmanJ.bin", "Trappee.bin", "Trapper.bin", "Unorthodox.bin", "WaitzkinJ.bin", "Weak.bin", "ZukertortJ.bin ",] 


const survivors = [ "AlekhineA.bin", "AnandV.bin", "AnderssenA.bin", "BirdH.bin", "BlackburneJ.bin", "BogoljubowE.bin", "BotvinnikM.bin", "CMX.bin", "CapablancaJR.bin", "ChigorinM.bin", "EarlyQueen.bin", "EuweM.bin", "EvansL.bin", "FastBook.bin", "FastLose.bin", "FineR.bin", "FischerR.bin", "FlohrS.bin", "Gambit.bin", "GellerE.bin", "IvanchukV.bin", "KamskyG.bin", "KarpovA.bin", "KashdanI.bin", "KeresP.bin", "KnightMoves.bin", "KorchnoiV.bin", "KramnikV.bin", "LarsenB.bin", "LaskerE.bin", "LekoP.bin", "LowCaptureBook.bin", "MarshallF.bin", "Mentor.bin", "MentorFrench.bin", "MentorGerman.bin", "Merlin.bin", "MorphyP.bin", "NajdorfM.bin", "NimzowitschA.bin", "NoBook.bin", "OldBook.bin", "PaulsenL.bin", "PawnMoves.bin", "PetrosianT.bin", "PillsburyH.bin", "PolgarJ.bin", "Reference.bin", "ReshevskyS.bin", "RetiR.bin", "RubinsteinA.bin", "SeirawanY.bin", "ShirovA.bin", "ShortN.bin", "SmyslovV.bin", "SpasskyB.bin", "SteinitzW.bin", "TalM.bin", "TarraschS.bin", "TartakowerS.bin", "TimmanJ.bin", "Trapper.bin", "Unorthodox.bin", "WaitzkinJ.bin", "Weak.bin", "ZukertortJ.bin",]

console.log(starters.length)
console.log(survivors.length)

const orphans = []
for (book of starters) {
  if (!survivors.includes(book)) orphans.push(book) 
}

console.log(orphans)
console.log(orphans.length)
