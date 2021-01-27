import { Engine } from 'node-uci'
const engine = new Engine('C:/Users/Toby/code/yeoldwiz/Wb2Uci.exe')
await engine.init()
await engine.setoption('protover', 'hard')
try {
    await engine.isready()
} catch (err) {
    console.log(err)
}
console.log('Howdy')
console.log('engine ready', engine.id, engine.options)

// or
// const Engine = require('node-uci').Engine
// // const engine = new Engine('/mnt/c/Users/Toby/code/yeoldwiz/Wb2Uci.exe')
// const engine = new Engine('C:/Users/Toby/code/yeoldwiz/Wb2Uci.exe')
// engine.init().then((obj)=> {
//     console.log(obj)
// })


// // async/await
// async function begin() {
//     try {
//         const engine = new Engine('/mnt/c/Users/Toby/code/yeoldwiz/Wb2Uci.exe')
//         await engine.init()
//         // await engine.setoption('MultiPV', '4')
//         await engine.isready()
//         console.log('engine ready', engine.id, engine.options)
//         const result = await engine.go({ nodes: 2500000 })
//         console.log('result', result)
//         await engine.quit()
//     } catch(err) {
//         console.log('Howdy from error land')
//         console.log(err)
//     }
// }

// begin()
