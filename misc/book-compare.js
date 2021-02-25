const cmBooks = ["FischerR", "AlekhineA", "BotvinnikM", "Depth4", "FastLose", "IvanchukV", "KramnikV", "MentorFrench", "OldBook", "ReshevskyS", "SmyslovV", "TimmanJ", "AnandV", "CMX", "Depth6", "FineR", "KamskyG", "LarsenB", "MentorGerman", "PaulsenL", "RetiR", "SpasskyB", "Trappee", "AnderssenA", "CapablancaJR", "Drawish", "KarpovA", "LaskerE", "Merlin", "PawnMoves", "RubinsteinA", "SteinitzW", "Trapper", "Bipto", "CaptureBook", "EarlyQueen", "KashdanI", "LekoP", "MorphyP", "PetrosianT", "SeirawanY", "Strong", "Unorthodox", "BirdH", "ChigorinM", "EuweM", "FlohrS", "KeresP", "LowCaptureBook", "NajdorfM", "PillsburyH", "ShirovA", "TalM", "WaitzkinJ", "BlackburneJ", "DangerDon", "EvansL", "Gambit", "KnightMoves", "MarshallF", "NimzowitschA", "PolgarJ", "ShortN", "TarraschS", "Weak", "BogoljubowE", "Depth2", "FastBook", "GellerE", "KorchnoiV", "Mentor", "NoBook", "Reference", "SlowBook", "TartakowerS", "ZukertortJ" ]

const binBooks = ["AlekhineA", "AnandV", "AnderssenA", "Bipto", "BirdH", "BlackburneJ", "BogoljubowE", "BotvinnikM", "CMX", "CapablancaJR", "CaptureBook", "ChigorinM", "DangerDon", "Depth2", "Depth4", "Depth6", "Drawish", "EarlyQueen", "EuweM", "EvansL", "FastBook", "FastLose", "FineR", "FischerR", "FlohrS", "Gambit", "GellerE", "IvanchukV", "KamskyG", "KarpovA", "KashdanI", "KeresP", "KnightMoves", "KorchnoiV", "KramnikV", "LarsenB", "LaskerE", "LekoP", "LowCaptureBook", "MarshallF", "Mentor", "MentorFrench", "MentorGerman", "Merlin", "MorphyP", "NajdorfM", "NimzowitschA", "NoBook", "OldBook", "PaulsenL", "PawnMoves", "PetrosianT", "PillsburyH", "PolgarJ", "Reference", "ReshevskyS", "RetiR", "RubinsteinA", "SeirawanY", "ShirovA", "ShortN", "SlowBook", "SmyslovV", "SpasskyB", "SteinitzW", "Strong", "TalM", "TarraschS", "TartakowerS", "TimmanJ", "Trappee", "Trapper", "Unorthodox", "WaitzkinJ", "Weak", "ZukertortJ"]  

console.log(`${cmBooks.length} cm books`)
console.log(`${binBooks.length} bin books`)

let missingBooks = []

for (const book of cmBooks) {
  if (!binBooks.includes(book)) missingBooks.push(book)
}

missingBooks = missingBooks.sort()

console.log(`${missingBooks.length} books left`)
for (const book of missingBooks) {
  console.log(book) 
}
