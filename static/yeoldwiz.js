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
          high: 2701,
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
    console.log(group.title)
    group.cmps = getRatingGroup(cmps, group.high, group.low)
    console.log(group.cmps.length)
  }
  // console.log(app.groups)
}

function getRatingGroup(cmps, high, low) {
  console.log(low, high)
  const cmpGroup = cmps.filter(cmp => {
    return (cmp.rating >= low) && (cmp.rating < high) 
  }) 
  return cmpGroup.reverse()
}