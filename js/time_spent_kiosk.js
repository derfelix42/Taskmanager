/**
  * ### TimeSpentKiosk ###
  *
  *
  * {name: "", main: true, time: 0}
  */

const items = [
  {name: "Uni", category: 1, query: ""},
  {name: "Wachmann", category: 13, query: ""},
  {name: "WebTech", category: 10, query: ""},
  {name: "Sport", category: 7, query: ""},
]

const time = document.getElementById("time");

const item_1 = document.getElementById("item-1");
const item_2 = document.getElementById("item-2");
console.log(item_2)
const item_3 = document.getElementById("item-3");
const item_4 = document.getElementById("item-4");
const klavier = document.getElementById("klavier")
const summe = document.getElementById("summe");

async function setCatCols() {
  const cols = await getCategoryColors()
  for(let item of items) {
    item.color = cols.filter(cat => parseInt(cat.ID) === item.category)[0].color
  }

  item_1.getElementsByClassName("categoryIndicator")[0].style.setProperty('--color', items[0].color);
  item_2.getElementsByClassName("categoryIndicator")[0].style.setProperty('--color', items[1].color);
  item_3.getElementsByClassName("categoryIndicator")[0].style.setProperty('--color', items[2].color);
  item_4.getElementsByClassName("categoryIndicator")[0].style.setProperty('--color', items[3].color);
}
setCatCols()

function calcTimeString(seconds) {
    const secs = Math.floor(seconds % 60);
    const min = Math.floor(seconds / 60 % 60);
    const hour = Math.floor(seconds / 60 / 60);

    const timer_string = (Math.floor(hour/10) > 0 ? String(hour.toFixed(0)) : "0"+String(hour.toFixed(0)))
        +":"+(Math.floor(min/10) > 0 ? String(min.toFixed(0)) : "0"+String(min.toFixed(0)))
        +":"+(Math.floor(secs/10) > 0 ? String(secs.toFixed(0)) : "0"+String(secs.toFixed(0)));
    return timer_string;
}

async function getData() {
    let d = new Date()
    let diff = d.getDate()-d.getDay()+(d.getDay()===0?-6:1);

    const res = await fetch("api/getWeeksTasks.php?date="+(new Date(d.setDate(diff)).toISOString().split('T')[0]));
    let json = await res.json();
    console.log(json)

    json = json.filter(t => t.time_spent > 0);



    let times = [0,0,0,0]
    let klavier_time = 0;

    json.forEach(t => {
      for(let i = 0; i < times.length; i++) {
        const catID = items[i].category
        const selector = items[i].query

        if(parseInt(t.category) === catID) {
          if((selector === "") || (selector!=="" && t.Name.startsWith(selector))) {
            times[i] += parseInt(t.time_spent);
            continue
          }
        }
      }

      if(t.Name.startsWith("Klavier")){
          klavier_time += parseInt(t.time_spent);
      }
    });

    item_1.getElementsByClassName("timer")[0].innerText = calcTimeString(times[0])
    item_2.getElementsByClassName("timer")[0].innerText = calcTimeString(times[1])
    item_3.getElementsByClassName("timer")[0].innerText = calcTimeString(times[2])
    item_4.getElementsByClassName("timer")[0].innerText = calcTimeString(times[3])

    klavier.innerText = calcTimeString(klavier_time);

    summe.innerText = calcTimeString(times[0] + times[1] + times[2] + times[3] + klavier_time);

    let currTime = new Date();
    time.innerText = String(currTime.getHours()).padStart(2, "0")+":"
      +String(currTime.getMinutes()).padStart(2, "0")+":"
      +String(currTime.getSeconds()).padStart(2, "0");

    console.log(json);
}

const title_1 = item_1.getElementsByClassName("title")[0];
const title_2 = item_2.getElementsByClassName("title")[0];
const title_3 = item_3.getElementsByClassName("title")[0];
const title_4 = item_4.getElementsByClassName("title")[0];

title_1.innerText = items[0].name
title_2.innerText = items[1].name
title_3.innerText = items[2].name
title_4.innerText = items[3].name

getData();

setInterval(getData, 1000);
