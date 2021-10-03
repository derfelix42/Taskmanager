const ba_mac = document.getElementById("ba-mac");
const stocha = document.getElementById("stocha");
const algo = document.getElementById("algo");
const webtech = document.getElementById("webtech");
const summe = document.getElementById("summe");
const time = document.getElementById("time");
const klavier = document.getElementById("klavier")

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

    json = json.filter(t => t.time_spent > 0);

    let ba_mac_time = 0;
    let stocha_time = 0;
    let algo2_time = 0;
    let webtech_time = 0;
    let klavier_time = 0;
    
    json.forEach(t => {
        if(t.Name.startsWith("[BA-MAC]")){
            ba_mac_time += parseInt(t.time_spent);
        } else if(t.Name.startsWith("[Stocha]")){
            stocha_time += parseInt(t.time_spent);
        } else if(t.Name.startsWith("[AlgoII]")){
            algo2_time += parseInt(t.time_spent);
        } else if(t.Name.startsWith("[WebTech]")){
            webtech_time += parseInt(t.time_spent);
        } else if(t.Name.startsWith("Klavier")){
            klavier_time += parseInt(t.time_spent);
        }
    });

    ba_mac.innerText = calcTimeString(ba_mac_time);
    stocha.innerText = calcTimeString(stocha_time);
    algo.innerText = calcTimeString(algo2_time);
    webtech.innerText = calcTimeString(webtech_time);
    klavier.innerText = calcTimeString(klavier_time);

    summe.innerText = calcTimeString(ba_mac_time + stocha_time + algo2_time + webtech_time);

    let currTime = new Date();
    time.innerText = String(currTime.getHours()).padStart(2, "0")+":"
      +String(currTime.getMinutes()).padStart(2, "0")+":"
      +String(currTime.getSeconds()).padStart(2, "0");

    console.log(json);
}

getData();

setInterval(getData, 1000);