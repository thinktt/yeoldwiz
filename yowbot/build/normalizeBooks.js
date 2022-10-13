// Some of the Books in CM11 are not compatible with obk2bin.exe (see tools). 
// They can be fixed by replaceing the code at the beginnigg of the binary
// this script does that. 

const fs = require('fs')

const books = ['Bipto.obk','CaptureBook.obk','DangerDon.obk','Depth2.obk','Depth4.obk','Depth6.obk','Drawish.obk','EarlyQueen.obk','FastBook.obk','FastLose.obk','Gambit.obk','KnightMoves.obk','LowCaptureBook.obk', 'Merlin.obk','NoBook.obk','OldBook.obk','PawnMoves.obk','SlowBook.obk','Strong.obk','Trappee.obk','Trapper.obk','Unorthodox.obk','Weak.obk']


// obk folder fixed hash 1acc78250646228ef3243066ba9d1882
// final bin folder no mentor books hash 

const headerData = Buffer.from([0x42, 0x4f, 0x4f, 0x21])
const padding = Buffer.from([0x0, 0x0, 0x0, 0x0])

// console.log(headerData)

let i = 0
for (const book of books) {
  const bookData = fs.readFileSync(book)
  console.log(bookData.slice(6,20), book)

  if (bookData.slice(0,4) + '' !== 'BOO!') {
    console.log(`normalizing ${book}`)
    const newBookData =  Buffer.concat([ 
      headerData, bookData.slice(4, 6), padding, bookData.slice(6,) 
    ])
    fs.appendFileSync(`fixed/${book}`, Buffer.from(newBookData))
    i++
  }
}
console.log('books normalized', i)





// const books = ["FischerR.obk", "AlekhineA.obk", "BotvinnikM.obk", "Depth4.obk", "FastLose.obk", "IvanchukV.OBK", "KramnikV.OBK", "MentorFrench.obk", "OldBook.obk", "ReshevskyS.obk", "SmyslovV.obk", "TimmanJ.obk", "AnandV.obk", "CMX.obk", "Depth6.obk", "FineR.obk", "KamskyG.obk", "LarsenB.obk", "MentorGerman.OBK", "PaulsenL.OBK", "RetiR.obk", "SpasskyB.obk", "Trappee.obk", "AnderssenA.obk", "CapablancaJR.obk", "Drawish.obk", "KarpovA.obk", "LaskerE.obk", "Merlin.obk", "PawnMoves.obk", "RubinsteinA.obk", "SteinitzW.obk", "Trapper.obk", "Bipto.obk", "CaptureBook.obk", "EarlyQueen.obk", "KashdanI.OBK", "LekoP.OBK", "MorphyP.obk", "PetrosianT.obk", "SeirawanY.obk", "Strong.obk", "Unorthodox.obk", "BirdH.obk", "ChigorinM.OBK", "EuweM.obk", "FlohrS.obk", "KeresP.obk", "LowCaptureBook.obk", "NajdorfM.OBK", "PillsburyH.obk", "ShirovA.obk", "TalM.obk", "WaitzkinJ.obk", "BlackburneJ.obk", "DangerDon.obk", "EvansL.obk", "Gambit.obk", "KnightMoves.obk", "MarshallF.obk", "NimzowitschA.obk", "PolgarJ.obk", "ShortN.obk", "TarraschS.obk", "Weak.obk", "BogoljubowE.obk", "Depth2.obk", "FastBook.obk", "GellerE.OBK", "KorchnoiV.obk", "Mentor.OBK", "NoBook.obk", "Reference.OBK", "SlowBook.obk", "TartakowerS.OBK", "ZukertortJ.OBK"]
// const books = ["Depth4.obk", "FastLose.obk", "IvanchukV.OBK", "KramnikV.OBK", "MentorFrench.obk", "Bipto.obk"]
// const bookToOpen = "EarlyQueen.obk"

// const bookShas = {
//   'AlekhineA.bin': '62d8f880d06b8de095972cbad362cef4a340eb424d8f83c81d21437ac0876451',
//   'AnandV.bin': 'd0ef256e7529e34e9caae4be0d97a1f226d783a98fe795bbb77559a621095f9d',
//   'AnderssenA.bin': '7cac8238dc9d3db23de798b1f0599b34048a8187fc0eccc061a49adc9b231d8a',
//   'Bipto.bin': '6f9f13ac5c6ee469b098636b9b4492cf0af7242a9e5ffb4f3429cc4d5980815f',
//   'BirdH.bin': '4cc0be67444c847c073aa87a3475845823c92ab4a672eb05c52681887405b2ff',
//   'BlackburneJ.bin': '0519d13880011d61e23348c3b91669796a356b40c89191e28d18d0df4675e413',
//   'BogoljubowE.bin': 'ce170f9c7ea3747e9630b9f631f1915ec78ea9ae58d48adfb3c6cefcb2a66995',
//   'BotvinnikM.bin': '96de7adbacc4fd0f9bfdb9191e83a4a75107890b35587a911920c4184a5e603e',
//   'CMX.bin': '1423575f3b91ced527691817125ebff4da91584ed0991a5d5fdf6fb1152fdb2d',
//   'CapablancaJR.bin': 'e92b0a1edf493a87a8361eaed940f2d7ef82e7bffd24a556823b46376a75b67a',
//   'CaptureBook.bin': 'ec7fb937b72cb284fcc6e36d6cc8a2b83771dd4d7a51f25874a68a525b58d6c6',
//   'ChigorinM.bin': 'cdd9919414b4d6b79b1ce3427e4d97514f7cd507c4569c3f2149065d12140a79',
//   'DangerDon.bin': '6c7415b07963585d336853ceae5585fbac85d3c2c61f55167bcc5af3cc36dbca',
//   'Depth2.bin': '30a58c8f0e6b4daac91c13994e44e4ba96659741e1af955551a6c5c4732e2f58',
//   'Depth4.bin': '72f14e6792e3816864f975f867c9daf730b2a8c109ce38601257feb5aa665415',
//   'Depth6.bin': 'b8e0c66cc94246bc3f5fc06a99a0b262ea5f010844db2c6511e2e28b91a2a011',
//   'Drawish.bin': 'd50a84bbc76bcae6b1fa482aabbf99bf9e41eba1700bea841e15e9327a8e3333',
//   'EarlyQueen.bin': '5c24681352a9ff80dddab64fe739dbcfce58e5a22f2daf2b3fc0681c856f92de',
//   'EuweM.bin': '24becf49651b413e900453b949ce26983cd00aa60a19e0adf072b335915c67ae',
//   'EvansL.bin': '09e832cdafbbc9c84eb10a7e19f6516eb4bd61c8470912c7469513b59e8ce771',
//   'FastBook.bin': 'da917cd3dfad7b301cbc9336242453918ad906a118554bf0cb3c414e0b23d5d1',
//   'FastLose.bin': 'a1da92076c837abbffe67add8898e23fef301493d695f7f0cd950f6ff7780dec',
//   'FineR.bin': '778ab91def16ac1cac19855c7f451370841125fb080864d13dedd6eb9c248b1e',
//   'FischerR.bin': 'a1defacc68470f1b2f4b441814b5b6b834ad9a4926753cc9c73feb758146fdcc',
//   'FlohrS.bin': '618f6a23c18ed3e506c622daeec7e0a2851c15030186e9efcf48fc4b01826582',
//   'Gambit.bin': '2005c7da9df03a026c54a9f0e411ecfb94dfcdc19115fa99625dc60dba75c212',
//   'GellerE.bin': 'e75a738a3dafb29019750f668363818141576f73c5732f4dc0d4558385eaf32c',
//   'IvanchukV.bin': '3efe1656ad3582e52bf9b82d29e8ada9a6db80baedb04c511cd2df300dd32f88',
//   'KamskyG.bin': 'f7260d2b7c32f9e615c418627db04dd3cbdcfb89a5b0745abbc4f382b668f2d4',
//   'KarpovA.bin': 'ba4fbc3775aa3463785190063cd962bf8d6b8187a2c040988152b20772c9ed01',
//   'KashdanI.bin': 'df2a3e34d9ef3356005480dc7b01c18b12b56fe0f1478a96f9c0b5ee5a4183a6',
//   'KeresP.bin': 'bef07fb5ac9e2362c06f472119ecfd897ac7ddafdb23ef5b9e037ffff763a769',
//   'KnightMoves.bin': '68d8b29959dbe514adf3ab69483bf5bafb28c739fb93df42ef54768d2edad795',
//   'KorchnoiV.bin': 'df593c59bae724b69dbf846228d5843f6a1a964f65daac6248a2f96d090704a0',
//   'KramnikV.bin': '912dca359db8810dad8a7a85cff61e488f93119147f2166e01e1d4314980a47d',
//   'LarsenB.bin': '5c2dccd7d7abe89d2c5d9d4476aabb220bd47ecd159db6bccb131dce633d3f12',
//   'LaskerE.bin': '36ab18ba903599c8387cefcbef4bdc65f887ee9b1d0ad93d59316f9655e445f0',
//   'LekoP.bin': '23715490ccb7620c67a36c52f242b277be606d7d3ea3cfbe3ecceaead9af857a',
//   'LowCaptureBook.bin': '50498071f6e7c93bf59a3031727c1869234baaea3196c22d0a08d46504d6e4a9',
//   'MarshallF.bin': '5c83dff18850de826117fdc479b9f091c30e894f220a9cda0ddd552cd70c3661',
//   'Mentor.bin': '02d9d88e086d56e122041a03255e21a21edbed8902aa0e8b9d3f3ab739eb4a1f',
//   'MentorFrench.bin': '4226e6846e4793e078e558b65327911b63992931d716328a05ee9af413754758',
//   'MentorGerman.bin': '4226e6846e4793e078e558b65327911b63992931d716328a05ee9af413754758',
//   'Merlin.bin': '756d652a7e90c9a83f631a9aad042e7a55bf9a416d96d1aee3300c3144be942a',
//   'MorphyP.bin': '4c132ee6a104b4f615521375314d6890a83002ab500430efb6e437d43cad55a9',
//   'NajdorfM.bin': '3b2883cd3e01e071a590ea47054b37702fc1486dcc8ff40a86a8c0f498ba14e9',
//   'NimzowitschA.bin': '396278d6d10c1daa2dff3a1188ddba709b513f69e4eeef5c9572961c726ec44a',
//   'NoBook.bin': '9ea45aef320917964a9c98523b5b66fd8f9f94405c76b015ac8a8ac2e2cd130b',
//   'OldBook.bin': 'c0fa3d080b32d879320ea6f372a84a96fe7bbfccc0484f3471480b6be4674baa',
//   'PaulsenL.bin': '040a9eae926b86db0a9fcc3c978dda896610816c46051ba99bbfed50294596bd',
//   'Pawnmoves.bin': '83f5147a10b13505734b7032e2e0af36a86d7b0bfb1c96b6702889ef8c3f2990',
//   'PetrosianT.bin': '033bcc2dedb54153be2ecc567c85dc8bd68bf06e7bd419038d3e96d7c44e9744',
//   'PillsburyH.bin': '07390660600f4ca56652aaca3eba1a817c5acefff6dab861de4e4156895c3c13',
//   'PolgarJ.bin': '3ce9e9b3ac664f41764b4d16f95a0c5882101e0b939ea3012c6042e9e8820a04',
//   'Reference.bin': '02d9d88e086d56e122041a03255e21a21edbed8902aa0e8b9d3f3ab739eb4a1f',
//   'ReshevskyS.bin': 'b4ffce8654df76302fb8aa8342a980b6efb05f1d6acb867cee4a6db82229441e',
//   'RetiR.bin': '78d5e523db4388c96b8192bf3aa00413818d55cdec58606925d58c6bbb91dad9',
//   'RubinsteinA.bin': 'a7a90f6bd46d9e4e81c63158f36241529a739f43f3f7bee4c124ac1573543299',
//   'SeirawanY.bin': 'd47a9338bdc0c1a80013e169a39a919602720c9ed0e14c8910846bbe58fb72a0',
//   'ShirovA.bin': 'c9076cb203f849a1d7d9d47a738469850120acd508ad8717be9d83ff7d9c611a',
//   'ShortN.bin': '268eb14862fe5758ee8296e79e96abab53394fee7bbe1e91f6855b168946a8e3',
//   'SlowBook.bin': 'd8e0ca9cacf2a004201101c88f92432fafd63d4269ed6c15c9ef1596db767c6a',
//   'SmyslovV.bin': '698fd964fdaf0f67bdc0fcd32644a6c5e9c0b56ce3527be1438c623872306b81',
//   'SpasskyB.bin': '996f8588282da92dc1c9e515416ab9e927cd8fb16a4442c48d71e6f020ee16fe',
//   'SteinitzW.bin': 'e6147aa5e00702e3e53bb8a7b8199db57df39df6c0f0cd9868202cddb423b8ad',
//   'Strong.bin': 'ebc014e936591779535add8232c6998e131f6602c923b9d82d836d49a34244a3',
//   'TalM.bin': 'e15be99eba872ab5861fe605191764e9e2bb78272338d88cf1f3438e62919480',
//   'TarraschS.bin': 'b0e416e1d2c1e6c633b9dfb51ecabbe85ed9ec6e074d7b23f9ee417682811878',
//   'TartakowerS.bin': '5ac3879d82555dc727fc3a5bcf5a4ab7c81e081f91c3715bcc318419cf79f145',
//   'TimmanJ.bin': 'f7fc2e187f6ff815dd7b485db154421739aa4fb94a46f6e65d87a289993cf585',
//   'Trappee.bin': 'abaab672788abf55f4cc9e0ec3e2fcc0b54f7faa8227b7f48813b880361fabf2',
//   'Trapper.bin': '4ebe3dd9d14d1073ebb84c7d6356b6911ad56c31806e79e3e1421f1b6b63b7a6',
//   'Unorthodox.bin': '70f24c25fa2cc9f64015b218069dc0fe11a984f304f4d0a608b613f0244d7d3f',
//   'WaitzkinJ.bin': '0b516cf5c38db9a9b338328125a01782b6a40ecde51946718ea2eb4b155a7c15',
//   'Weak.bin': '5cfacd6dc2f1533c6746ec447c64a6997476df21d014931157ef73bce5361d65',
//   'ZukertortJ.bin': '963ae022df48f43ac96f62aace05fbbee551adbe1bcae36fb89bbc8f1016daa9',
// }


// console.log(bookData)
// const newBookData =  Buffer.concat([ headerData, bookData.slice(8) ])
// console.log(newBookData)




// fs.appendFileSync('z1' + bookToOpen, Buffer.from(newBookData))

// bookData = fs.readFileSync('zzEarlyQueen.OBK')
// console.log(bookData)




// fs.open(bookToOpen, 'r', function(status, fd) {
//     if (status) {
//         console.log(status.message);
//         return;
//     }
//     var buffer = Buffer.alloc(1000);
//     fs.read(fd, buffer, 0, 100, 0, function(err, num) {
//         // console.log(buffer.toString('utf8', 0, num));
//         console.log(buffer)
//     });
// });

// console.log(fileByteArray)

// const replacementBytes = new TextEncoder().encode('BOO!')

// console.log(`Attempting to normalize ${books.length} books`)

// for (const book of books) {
//   fs.open(book, "r+", (err, fd) => {
//     if(!err) {
//       fs.write(fd, replacementBytes, 0, 4, 0, (err, bw, buf) => {
//         if(!err) {
//             console.log(`Success normalizing ${book}`)
//         } else {
//             console.log(`Failed to normalizing ${book}`)
//         }
//       });
//     } else {
//       console.log(`Error with book ${book}`)
//     }
//   });
// }