rhb_id = -1
bonn_id = -1

async function getDepartingTrains(id) {
  const url = "https://bahn.expert/api/iris/v2/abfahrten/"+id+"?lookahead=120"
  const resp = await fetch(url)
  const json = await resp.json()
  return json
}

function formatTime(time, seconds = false) {
  let time_string = ""
  if(seconds) {
    let secs = Math.floor(time % 60)
    let min = Math.floor(time / 60 % 60)
    let hour = Math.floor(time / 60 / 60)

    time_string = String(hour.toFixed(0)).padStart(2, "0")+":"
    +String(min.toFixed(0)).padStart(2, "0")
  } else {
    let currTime = new Date(time)
    console.log(currTime)
    time_string = String(currTime.getHours()).padStart(2, "0")+":"
      +String(currTime.getMinutes()).padStart(2, "0")
  }
  return time_string
}

function formatDelay(delay) {
  let delay_string = ""
  if(delay && delay !== 0) {
    delay_string = " ("
    delay_string += delay>0?"+":""
    delay_string += delay
    delay_string += ")"
  }
  return delay_string
}

function appendLi(ul, train, first=false) {
  let time_string = formatTime(train.departure.time)
  let delay_string = formatDelay(train.departure.delay)

  let li = document.createElement("li")
  let icon = document.createElement("i")
  icon.classList.add("fa", "fa-train", "small")

  console.log(train)

  let string = " "+train.train.type+train.train.line+" auf Gleis "+train.platform+" | "+train.route[0].name+" -> "+train.destination+" | "+time_string+delay_string

  if(first) {
    string = " Nächster Zug um "+time_string+" mit "+train.departure.delay+"m Verspätung. Verbleibende Zeit: "+formatTime((new Date(train.departure.time)-new Date())/1000, true)
  }

  let text = document.createTextNode(string)

  li.appendChild(icon)
  li.appendChild(text)
  ul.appendChild(li)
}

async function getRheinbachBonn() {
  const json = await getDepartingTrains(rhb_id)
  const div = document.getElementById("rhb_bonn_ul")
  let first = true
  for(let train of json.departures) {
    if(train.destination === 'Bonn Hbf') {
      appendLi(div, train, first)
      first = false
    }
  }
}

async function getBonnRheinbach() {
  const json = await getDepartingTrains(bonn_id)
  const div = document.getElementById("bonn_rhb_ul")
  let first = true

  for(let train of json.departures) {
    if(train.destination === "Rheinbach") {
      appendLi(div, train, first)
      first = false
    }
  }
}




getRheinbachBonn()
getBonnRheinbach()
console.log("BahnAPI!")
