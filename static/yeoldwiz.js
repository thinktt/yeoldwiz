startApp()

async function startApp() {
  const res = await fetch('personalities.json')
  const cmpsObj = await res.json()
  const cmps = Object.entries(cmpsObj).map(e => e[1]).reverse()

  const app = new Vue({
    el: '#app',
    data: {
      groups : [
        {
          title: 'The Grandmasters',
          high: 2700,
          low: 2700,
          cmps: [],
        }, 
        {
          title: 'Masters',
          high: 2650,
          low: 2000,
          cmps: [],
        },
        {
          title: 'Club Players',
          high: 2000,
          low: 1500,
          cmps: [],
        },
        {
          title: 'Casual Players',
          high: 1500,
          low: 1000,
          cmps: [],
        },
        {
          title: 'Beginners',
          high: 1000,
          low: 500,
          cmps: [],
        },
        {
          title: 'Noobs',
          high: 500,
          low: 0,
          cmps: [],
        },
      ]
    }
  })

  for (const group of app.groups) {
    group.cmps = getRatingGroup(cmps, group.high, group.low)
  }

  console.log(app.groups)
}

function getRatingGroup(cmps, low, high) {
  // console.log(low, high)
  return cmps.filter(cmp => cmp.rating <= high && cmp.rating >= low)
}

function renderCmp(cmp) {
  let face = cmp.face
  const name = cmp.name
  const rating = cmp.rating
  const summary = cmp.summary
  if (face === 'LarryC.png') face = 'Master.png'
  const imgHtml = `
    <div> 
      <img class="face" src="/images/faces/${face}" alt="${name}">
    </div>
  `
      // <span>${name}</span>
      // <span>Rated ${rating}</span>
      // <span>${summary}</span>

  document.createElement()
  document.body.innerHTML += imgHtml
}


