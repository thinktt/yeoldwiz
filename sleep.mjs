
// let isSleeping = true
// setTimeout(() => {
//   isSleeping = false
// }, 10000)
// while (isSleeping) {}
await new Promise(r => setTimeout(r, 2000))
console.log('done')