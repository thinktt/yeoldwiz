
async function startApp() {
  const res = await fetch('personalities.json')
  const cmps = await res.json()
  
  for (const cmp in cmps) {
    // console.log(cmp)
    let face = cmps[cmp].face
    const name = cmps[cmp].name
    if (face === 'LarryC.png') face = 'Master.png'
    const imgHtml = 
      `<img class="face" src="/images/faces/${face}" alt="${name}">`
    document.body.innerHTML += imgHtml
  }
}


startApp()