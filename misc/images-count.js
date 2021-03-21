
const images = ["Aaron", "Adam", "Alicia", "Amo", "Anders", "Andre", "Andy", "Andy_", "Annie", "Argyle", "Ash", "Ashley", "Audrey", "Bambi", "Ben", "Berry", "Billy", "Bobo", "Bogie", "Bonita", "Brett", "Bryce", "Buck", "Buddy", "Cal", "Carrie", "Cassie", "Charles", "Christian", "Clyde", "Cole", "Dana", "Darcy", "Dave", "Derek", "Diana", "Dobie", "Doc", "Dominic", "Dottie", "Dude", "Duke", "Dylan", "Eddie", "Elena", "Elijah", "Ella", "Eric", "frederic", "George", "Gil", "Ginger", "Griffin", "Guillaume", "Hans", "Hayden", "Ioan", "J.T.", "Jade", "Jax", "Jeff", "Jenna", "Jerry", "Jesse", "Jessica", "Jinx", "Joey", "John", "Jon", "Jonesie", "Josh12", "Josh6", "Josh7", "Josh8", "Josh9", "Josie", "Kamika", "Kanna", "Kendra", "Kenji", "Kia", "Kid", "Kris", "Krycek", "Lacey", "LarryC", "Laura", "Les", "Liam", "Lili", "Lisa", "Liz", "Logan", "Lori", "Lou", "Luca", "Lucy", "Luke", "LYDIA", "Manny", "Maria", "Mariah", "Marie", "Marius", "Mark", "Mateo", "Matthew", "Max", "Mia", "Michael", "Miguel", "Miranda", "Mona", "Monique", "Muldoon", "Natalie", "Niko", "Nikolai", "Odile", "Orin", "Parker", "Pete", "Petra", "Queenie", "Raina", "Raj", "Rand", "Rascal", "Rick", "Risa", "Ross", "Roxy", "Rusty", "Ryan", "Sabrina", "Sam", "Seb", "Seth", "Shakespeare", "Shannon", "Shaun", "Simon", "Skippy", "Slick", "Sonja", "Sunny", "Sven", "T.C.", "Tasha", "Teea", "Tex", "Thorian", "Tick", "Tina", "Toni", "Tracy", "Trent", "Trudy", "Turk", "Vanessa", "Vlad", "Waldo", "Wally", "Wendy", "Will", "Willow", "Winston"]

const misMatchImages = ["Dude", "Bobo", "LarryC"]
const misMatchPersons = ["Chessmaster", "Stanley", "Christiansen"]
const sysFaces = ["user", "User_created", "Userdef", "Winboard", "master", "hidden"]

const personalites = ["Aaron", "Adam", "Alekhine", "Alicia", "Amo", "Anand", "Anders", "Anderssen", "Andre", "Andy", "Annie", "Argyle", "Ash", "Audrey", "Ben", "Berry", "Bird", "Blackburne", "Bogie", "Bogoljubow", "Botvinnik", "Buck", "Buddy", "Cal", "Capablanca", "Carrie", "Cassie", "Charles", "Chessmaster", "Chigorin", "Christian", "Christiansen", "Cole", "Darcy", "Dave", "Diana", "Dobie", "Doc", "Duke", "Dylan", "Eddie", "Elijah", "Ella", "Eric", "Euwe", "Evans", "Fine", "Fischer", "Flohr", "Frederic", "Geller", "George", "Gil", "Ginger", "Griffin", "Guillaume", "Hans", "Hayden", "Ioan", "Ivanchuk", "J.T.", "Jade", "Jeff", "Jenna", "Jesse", "Jessica", "Jinx", "Joey", "John", "Jon", "Jonesie", "Josh12", "Josh6", "Josh7", "Josh8", "Josh9", "Kamika", "Kamsky", "Kanna", "Karpov", "Kashdan", "Kendra", "Kenji", "Keres", "Kid", "Korchnoi", "Kramnik", "Kris", "Krycek", "Lacey", "Larsen", "Lasker", "Laura", "Leko", "Liam", "Lili", "Lisa", "Liz", "Logan", "Lori", "Lou", "Luca", "Lucy", "Luke", "Lydia", "Manny", "Mariah", "Marie", "Marius", "Mark", "Marshall", "Mateo", "Max", "Michael", "Miguel", "Miranda", "Mona", "Monique", "Morphy", "Muldoon", "Najdorf", "Natalie", "Niko", "Nikolai", "Nimzowitsch", "Odile", "Orin", "Parker", "Paulsen", "Pete", "Petra", "Petrosian", "Pillsbury", "Polgar", "Queenie", "Raj", "Rand", "Reshevsky", "Reti", "Rick", "Risa", "Ross", "Roxy", "Rubinstein", "Rusty", "Sabrina", "Sam", "Seb", "Seirawan", "Seth", "Shakespeare", "Shaun", "Shirov", "Short", "Simon", "Skippy", "Slick", "Smyslov", "Sonja", "Spassky", "Stanley", "Steinitz", "Sunny", "Sven", "T.C.", "Tal", "Tarrasch", "Tartakower", "Tasha", "Teea", "Tex", "Thorian", "Tick", "Timman", "Tina", "Toni", "Trent", "Trudy", "Turk", "Vanessa", "Vlad", "Waitzkin", "Waldo", "Wally", "Wendy", "Will", "Willow", "Zukertort" ] 

let imgDiff = []
for (image of images) {
  if  ( !arrDoesHave(personalites.concat(misMatchImages), image) ) imgDiff.push(image) 
}

let personDiff = []
for (person of personalites) {
  if  ( !arrDoesHave(images.concat(misMatchPersons), person) ) personDiff.push(person) 
}

function arrDoesHave(items, str) {
  for (item of items) {
    if (item.toLowerCase() == str.toLowerCase()) return true 
  }
  return false
}


console.log(imgDiff)
console.log(imgDiff.length)
console.log(personDiff.sort())
console.log(personDiff.length)
console.log(sysFaces)
console.log(sysFaces.length)



