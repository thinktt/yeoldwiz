const cmBooks = ["FischerR", "AlekhineA", "BotvinnikM", "Depth4", "FastLose", "IvanchukV", "KramnikV", "MentorFrench", "OldBook", "ReshevskyS", "SmyslovV", "TimmanJ", "AnandV", "CMX", "Depth6", "FineR", "KamskyG", "LarsenB", "MentorGerman", "PaulsenL", "RetiR", "SpasskyB", "Trappee", "AnderssenA", "CapablancaJR", "Drawish", "KarpovA", "LaskerE", "Merlin", "PawnMoves", "RubinsteinA", "SteinitzW", "Trapper", "Bipto", "CaptureBook", "EarlyQueen", "KashdanI", "LekoP", "MorphyP", "PetrosianT", "SeirawanY", "Strong", "Unorthodox", "BirdH", "ChigorinM", "EuweM", "FlohrS", "KeresP", "LowCaptureBook", "NajdorfM", "PillsburyH", "ShirovA", "TalM", "WaitzkinJ", "BlackburneJ", "DangerDon", "EvansL", "Gambit", "KnightMoves", "MarshallF", "NimzowitschA", "PolgarJ", "ShortN", "TarraschS", "Weak", "BogoljubowE", "Depth2", "FastBook", "GellerE", "KorchnoiV", "Mentor", "NoBook", "Reference", "SlowBook", "TartakowerS", "ZukertortJ" ]

const binBooks = [
  "AlekhineA", "AnandV", "AnderssenA", "BirdH", "BlackburneJ", "BogoljubowE", "BotvinnikM", "CMX", "CapablancaJR", "ChigorinM", "EuweM", "EvansL", "FineR", "FischerR", "FlohrS", "GellerE", "IvanchukV", "KamskyG", "KarpovA", "KashdanI", "KeresP", "KorchnoiV", "KramnikV", "LarsenB", "LaskerE", "LekoP", "MarshallF", "Mentor", "MorphyP", "NajdorfM", "NimzowitschA", "PaulsenL", "PetrosianT", "PillsburyH", "PolgarJ", "Reference", "ReshevskyS", "RetiR", "RubinsteinA", "SeirawanY", "ShirovA", "ShortN", "SmyslovV", "SpasskyB", "SteinitzW", "TalM", "TarraschS", "TartakowerS", "TimmanJ", "WaitzkinJ", "ZukertortJ", "EarlyQueen"
]
  
let missingBooks = []

for (const book of cmBooks) {
  if (!binBooks.includes(book)) missingBooks.push(book)
}

missingBooks = missingBooks.sort()

console.log(`${missingBooks.length} books left`)
for (const book of missingBooks) {
  console.log(book) 
}
