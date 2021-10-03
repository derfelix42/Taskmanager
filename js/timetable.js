const canvas = document.getElementById('timetable');
let ctx;
let interval

let settings = {
  scale: 0.9,
  starttime: 4,
  endtime: 23,
  spacings: {
    hour: 35,
    day: 220,
  },
  start_x: 90,
  start_y: 60,
  overlap: 20,
  fontsize: 20,
  small_fontsize: 15,
}

let mouseX
let mouseY

let currentWeek = [
  {day: 0, date: "07.06.2021"},
  {day: 1, date: "08.06.2021"},
  {day: 2, date: "09.06.2021"},
  {day: 3, date: "10.06.2021"},
  {day: 4, date: "11.06.2021"},
  {day: 5, date: "12.06.2021"},
  {day: 6, date: "13.06.2021"},
]

let weekSelected = "current"
let dateOfMonday
const daysOfWeek = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]

let tasks = []
async function setup() {
  if(canvas) {
    ctx = canvas.getContext('2d');


    let d = new Date()
    let diff = d.getDate()-d.getDay()+(d.getDay()==0?-6:1)


    calculateMonday()
    // console.log(dateOfMonday, currentWeek)



    calculateScale()
//    console.log(ctx)

    resizeCanvas(ctx)
    window.addEventListener('resize', () => {resizeCanvas(); drawTimetable()});

    await updateTasks()
    drawTimetable()

    interval = setInterval(drawTimetable, 1/60*1000);
    let taskupdater = setInterval(updateTasks, 1000);

    canvas.addEventListener("mousemove", mousemovement, false);
    canvas.addEventListener("click", mouseclick, false);



  }
}

setup()

function calculateMonday() {
  let d = new Date()
  let diff = d.getDate()-d.getDay()+(d.getDay()==0?-6:1)


  if(weekSelected === "last") {
    diff = diff-7
  } else if(weekSelected === "next") {
    diff = diff+7
  }

  //console.log(day, diff, "test", new Date(d.setDate(diff)))
  dateOfMonday = new Date(d.setDate(diff))

  for(let i = 0; i < 7; i++) {
    let date = new Date(d.setDate(diff+i))
    currentWeek[i].date = String(date.getDate()).padStart(2, "0") + '.' + String(date.getMonth() + 1).padStart(2, "0") + '.' + date.getFullYear();
  }
}

function calculateScale() {
  const max_width = settings.start_x-settings.overlap+settings.spacings.day*7+settings.overlap*3
  //console.log("Scale would need to be:",(ctx.canvas.clientWidth/max_width))
  const scale = ctx.canvas.clientWidth/max_width
  if(scale > 0.65) {
    settings.scale = scale
  }
  else {
    settings.scale = 1
  }
}

function getCurrentWeekNumber() {
    let d = dateOfMonday

    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    // Get first day of year
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    return "KW·"+padZero(weekNo)+"·"+d.getUTCFullYear()
}

function drawTimetable() {
  //console.time('drawTimetable')
  resizeCanvas()
  calculateScale()
  ctx.fillStyle = "#222"
  ctx.fillRect(0,0,ctx.canvas.clientWidth,ctx.canvas.clientHeight)


  drawBlocking(0, 13,14)
  drawBlocking(1, 13,14)
  drawBlocking(2, 13,14)
  drawBlocking(3, 13,14)

  drawBlocking(0, 19,20)
  drawBlocking(1, 19,20)
  drawBlocking(2, 19,20)
  drawBlocking(3, 19,20)
  drawBlocking(4, 19,20)
  drawBlocking(5, 19,20)
  drawBlocking(6, 19,20)
  drawBlocking(6, 9,10)

  drawWakeUpPattern(0,5)
  drawWakeUpPattern(1,5)
  drawWakeUpPattern(2,5)
  drawWakeUpPattern(3,5)
  drawWakeUpPattern(4,5)
  drawWakeUpPattern(5,6.5)
  drawWakeUpPattern(6,6.5)

  drawWeek(ctx)
  drawTasks()
  drawCurrentTimeBar()
  for(let day = 0; day < 7; day++) {
    printDayTasks(day, tasks.filter(task => {return (task.dayofweek === day && !task.due_time)}))
  }

  drawMouseLine()

  drawButtons()

  ctx.fillStyle = "#fff"
  ctx.font = "18px Arial"
  const text = getCurrentWeekNumber()
  ctx.fillText(text, settings.start_x+settings.spacings.day*7*settings.scale+settings.overlap*3*settings.scale-ctx.measureText(text).width, 14)
  //console.timeEnd('drawTimetable')
}

function drawButtons() {
  let x_start = 100
  let y_start = 5
  ctx.font = "12px Arial"
  ctx.textAlign = "center"

  let weeks = ["last Week", "current Week", "next Week"]

  for(let index in weeks) {
    let title = weeks[index]

    let x1 = x_start+(index*150)
    let y1 = y_start
    let x2 = x_start+120+(index*150)
    let y2 = y_start+30

    let color = weekSelected === title.split(" ")[0] ? "GREEN" : "#fff"

    if(mouseX > x1 && mouseX < x2 && mouseY > y1 && mouseY < y2) {
      color = "#ff0"
    }

    ctx.fillStyle = color
    ctx.fillRect(x_start+(index*150), y_start, 120, 30)
    ctx.fillStyle = "#000";
    ctx.fillText(title, x_start+(120/2)+(index*150), y_start+(settings.fontsize/2))
  }
}

function checkButtonClick() {
  //console.log("checkButtonClick")
  let x_start = 100
  let y_start = 5
  let weeks = ["last Week", "current Week", "next Week"]

  for(let index in weeks) {
    let title = weeks[index]
    let x1 = x_start+(index*150)
    let y1 = y_start
    let x2 = x_start+120+(index*150)
    let y2 = y_start+30

    if(mouseX > x1 && mouseX < x2 && mouseY > y1 && mouseY < y2) {
      weekSelected = title.split(" ")[0]
      calculateMonday()
      updateTasks()
      //console.log("Button",index, weekSelected)
    }
  }
}

async function getTasks(date) {
  date = date.toISOString().split('T')[0]
  console.log("api/getWeeksTasks.php?date="+date)
  const res = await fetch("api/getWeeksTasks.php?date="+date);
  let json = await res.json()

  json.forEach(task => {
    //let time = task.due_time.split(":")[0]
    //task.end_time = (parseInt(time)+1)+":00:00"
    //console.log(task)
    if(task.due && task.due_time) {
      task.start = parseInt(task.due_time.split(":")[0])+(parseInt(task.due_time.split(":")[1]) / 60)

      if(task.duration !== null) {
        let split = task.duration.split(":")
        let seconds = parseInt(split[2])
        let minutes = parseInt(split[1])
        let hours = parseInt(split[0])
        task.end = parseInt(task.due_time.split(":")[0])+(parseInt(task.due_time.split(":")[1]) / 60)+hours+minutes/60+seconds/3600
      }

      if(task.time_spent !== "0") {
        let seconds = parseInt(task.time_spent) % 60
        let minutes = Math.floor(parseInt(task.time_spent) / 60) % 60
        let hours = Math.floor(parseInt(task.time_spent) / 3600)
        task.end = parseInt(task.due_time.split(":")[0])+(parseInt(task.due_time.split(":")[1]) / 60)+hours+minutes/60+seconds/3600
      }

      //task.end = parseInt(task.end_time.split(":")[0])+(parseInt(task.end_time.split(":")[1]) / 60)
    }

    task.bool_done = false
    if(task.done !== null) {
      task.bool_done = true
    }

    task.dayofweek = ((parseInt(task.dayofweek)+5)%7)%7

    task.Name = decodeURIComponent(task.Name)


    if(task.color === null) {
      task.color = "777"
    }
  })
  console.log(json)
  return json
}

async function updateTasks() {
  tasks = await getTasks(dateOfMonday)
}


function drawTasks() {
  tasks.forEach(task => {
    if(task.due && (task.time_spent >= 600 || parseInt(task.time_spent) === 0))  {
      let ob = {name: task.Name, day: task.dayofweek, startTime: parseFloat(task.start), endTime: parseFloat(task.end), color: "#"+task.color, done: task.bool_done}
      //console.log(ob)
      drawTask(ob)
    }
  })
}


function resizeCanvas() {
  const clientHeight = ctx.canvas.clientHeight
  const clientWidth = ctx.canvas.clientWidth

  ctx.canvas.height = clientHeight
  ctx.canvas.width = clientWidth
}

function drawWeek(ctx) {
  ctx.strokeStyle = '#ffffff';
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = 1;

  //console.log("drawing horizontal Lines")
  ctx.beginPath();
  for(let h = 0; h <= settings.endtime-settings.starttime; h+=1) {
    let y_start = settings.start_y + h*settings.spacings.hour*settings.scale
    let x_start = settings.start_x-settings.overlap;
    let x_end = x_start+settings.spacings.day*7*settings.scale+settings.overlap*2
    ctx.moveTo(x_start, y_start);
    ctx.lineTo(x_end, y_start);
  }
  ctx.stroke();

  //console.log("drawing vertical Lines")
  ctx.beginPath();
  for(let d = 0; d <= 7; d+=1) {
    let x_start = settings.start_x + d*settings.spacings.day*settings.scale
    let y_start = settings.start_y - settings.overlap
    let y_end = settings.start_y+(settings.endtime-settings.starttime)*settings.spacings.hour*settings.scale+settings.overlap
    ctx.moveTo(x_start, y_start);
    ctx.lineTo(x_start, y_end);
  }
  ctx.stroke();


  //console.log("adding Weekdays")
  ctx.font = (settings.fontsize*settings.scale)+"px Arial"
  ctx.fillStyle = "#ffffff"
  ctx.textAlign="center";
  ctx.textBaseline = "middle";


  currentWeek.forEach((day, index) => {
    let name = daysOfWeek[index]
    let text = name+", "+day.date
    //console.log(text)
    let center_x = settings.start_x+settings.spacings.day*settings.scale*index+settings.spacings.day*settings.scale/2
    let center_y = settings.start_y-settings.spacings.hour*settings.scale/2+8*settings.scale
    ctx.fillText(text, center_x, center_y);
  })


  ctx.textAlign = "right"
  //console.log("adding Time")
  for(let h = 0; h <= settings.endtime-settings.starttime; h+=1) {
    let text = (h+settings.starttime)+":00"
    let posy = settings.start_y + h*settings.spacings.hour*settings.scale
    ctx.fillText(text, settings.start_x-30, posy)
  }
}

function drawTask(task) {
  const day = task.day;
  const startTime = task.startTime
  const endTime = task.endTime
  const name = task.name
  const color = task.color

  // TODO: Sollte später in dem task-Objekt mit übergeben werden, damit Box-Collisions erkannt werden können -> Hover-Menüs etc
  const x_start = settings.start_x+day*settings.spacings.day*settings.scale
  const x_end = settings.start_x+(day+1)*settings.spacings.day*settings.scale
  const y_start = settings.start_y+(startTime-settings.starttime)*settings.spacings.hour*settings.scale
  const y_end = settings.start_y+(endTime-settings.starttime)*settings.spacings.hour*settings.scale

  const height = y_end - y_start
  const width = x_end - x_start

  const x_center = x_start + width/2
  const y_center = y_start + height/2

  let margin = 2

  //Draw Rect with Border
  //console.log(x_start+margin, y_start+margin, width-2*margin, height-2*margin)
  ctx.fillStyle = color;
  ctx.fillRect(x_start+margin, y_start+margin, width-2*margin, height-2*margin)
  ctx.lineWidth = margin/2;
  ctx.strokeStyle = "rgba(0,0,0,0.5)";
  ctx.strokeRect(x_start+margin, y_start+margin, width-2*margin, height-2*margin)

  //Write Name of Task
  let lines = wrapText(name, settings.spacings.day*settings.scale-2*margin-5)
  const possibleLineCount = height / (settings.fontsize*2*settings.scale)
  //console.log(lines, height, settings.fontsize*2*settings.scale, possibleLineCount)
  ctx.font = (settings.fontsize*settings.scale)+"px Arial"

  if(possibleLineCount < lines.length) {
    lines = lines.slice(0, possibleLineCount+1)
  }
  ctx.textAlign = "center"
  ctx.fillStyle = invertColor(color, true)
  let text_start_y = y_center
  if(lines.length>1)
    text_start_y = y_center-(Math.floor(lines.length/2)*settings.fontsize)-(lines.length%2)*settings.fontsize+settings.fontsize/2
  //console.log(lines, text_start_y, y_center)
  lines.forEach((line, index) => {
    ctx.fillText(line, x_center, text_start_y+settings.fontsize*index)
  })
}

function invertColor(hex, bw) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    var r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);
    if (bw) {
        // http://stackoverflow.com/a/3943023/112731
        return (r * 0.7 + g * 0.7 + b * 0.7) > 186
            ? '#000000'
            : '#FFFFFF';
    }
    // invert color components
    r = (255 - r).toString(16);
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);
    // pad each with zeros and return
    return "#" + padZero(r) + padZero(g) + padZero(b);
}

function padZero(str, len) {
    len = len || 2;
    var zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
}


function printDayTasks(day, list) {
  //console.log(list)
  const x_start = settings.start_x+day*settings.spacings.day*settings.scale
  const x_end = settings.start_x+(day+1)*settings.spacings.day*settings.scale
  const y_start = settings.start_y+(settings.endtime-settings.starttime)*settings.spacings.hour*settings.scale+settings.spacings.hour

  let currY = y_start

  ctx.font = (settings.small_fontsize*settings.scale)+"px Arial"
  ctx.fillStyle = "#ffffff"
  ctx.textAlign="left";
  ctx.textBaseline = "top";

  let radius = settings.small_fontsize/4

  list.forEach((task, index) => {
    let text = task.Name//+(task.bool_done?" ✓":"")
    if(parseInt(task.time_spent) > 0)
      text += " ("+Math.floor(task.time_spent/3600)+":"+String(Math.floor(task.time_spent/60%60)).padStart(2,'0')+")"
    let lines = wrapText(text, settings.spacings.day*settings.scale-3*radius-5)

    ctx.beginPath();
    ctx.arc(x_start+radius/2, currY+settings.small_fontsize/2, radius, 0, 2 * Math.PI, false);
    ctx.fill();

    for (let line of lines) {
      ctx.fillText(line, x_start+3*radius, currY);
      if(task.bool_done) {
        let width = ctx.measureText(line)
        ctx.strokeStyle = '#ffffff';
        ctx.fillStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x_start+3*radius, currY+settings.small_fontsize*settings.scale/2);
        ctx.lineTo(x_start+3*radius+width.width, currY+settings.small_fontsize*settings.scale/2);
        ctx.stroke();
      }
      currY+=settings.small_fontsize*settings.scale
    }


  })
}

function mousemovement(e) {
  mouseX = event.clientX - canvas.offsetLeft;
  mouseY = event.clientY - canvas.offsetTop;
}

function mouseclick(e) {
  //console.log(e)
  checkButtonClick()
}

function drawMouseLine() {
  if(mouseX > settings.start_x &&
    mouseY > settings.start_y &&
    mouseY < settings.start_y+(settings.endtime-settings.starttime)*settings.spacings.hour*settings.scale &&
    mouseX < settings.start_x+(settings.spacings.day*7*settings.scale)
  ){
    ctx.strokeStyle = "#f00"
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(settings.start_x-settings.overlap, mouseY);
    ctx.lineTo(settings.start_x+(settings.spacings.day*7*settings.scale)+settings.overlap, mouseY);
    ctx.stroke();
  }
}

function drawCurrentTimeBar() {
  if(weekSelected === "current") {
    let now = new Date()

    const currentDay = ((now.getDay()+6)%7)%7
    const currentTime = now.getHours()+(now.getMinutes()/60)

    const x_start = settings.start_x+currentDay*settings.spacings.day*settings.scale
    const x_end = settings.start_x+(currentDay+1)*settings.spacings.day*settings.scale
    const y_start = settings.start_y+(currentTime-settings.starttime)*settings.spacings.hour*settings.scale

    ctx.lineWidth = 3;
    ctx.strokeStyle = "#f00"
    ctx.beginPath()
    ctx.moveTo(x_start, y_start)
    ctx.lineTo(x_end, y_start)
    ctx.stroke()
  }
}

function drawBlocking(day,start,end) {
  const margin = settings.spacings.day/12
  const x_start = settings.start_x+day*settings.spacings.day*settings.scale
  const x_end = settings.start_x+(day+1)*settings.spacings.day*settings.scale
  const y_start = settings.start_y+(start-settings.starttime)*settings.spacings.hour*settings.scale
  const y_end = settings.start_y+(end-settings.starttime)*settings.spacings.hour*settings.scale

  const height = y_end - y_start

  let x1 = x_start
  let x2 = x_end-height
  let y1 = y_start
  let y2 = y_end

  let counter = 0

  while(x2+margin <= x_end && counter < 1000) {
    x1 = x_start+(counter*margin)
    x2 = x1-height

    if(x2 < x_start) {
      y2 = y_end - x_start + x2
      x2 = x_start
    } else {
      y2 = y_end
    }

    if(x1 > x_end) {
      y1 = y_start + (x1-x_end)
      x1 = x_end
    } else {
      y1 = y_start
    }

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#666"
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()

    //console.log(x1,y1,x2,y2)
    counter += 1
  }
}

function drawWakeUpPattern(day, time) {
  const margin = settings.spacings.day*settings.scale/12
  const x_start = settings.start_x+day*settings.spacings.day*settings.scale
  const x_end = settings.start_x+(day+1)*settings.spacings.day*settings.scale
  const y_start = settings.start_y+(time-0.5-settings.starttime)*settings.spacings.hour*settings.scale
  const y_end = settings.start_y+(time-settings.starttime)*settings.spacings.hour*settings.scale

  const height = y_end - y_start

  ctx.lineWidth = 2;
  ctx.strokeStyle = "#fff"

  let x1 = x_start
  let x2 = x_end-height
  let y1 = y_start
  let y2 = y_end

  let counter = 0

  while(x2+margin <= x_end+1 && counter < 1000) {
    x1 = x_start+(counter*margin)
    x2 = x1-height

    if(x2 < x_start) {
      y2 = y_end - x_start + x2
      x2 = x_start
    } else {
      y2 = y_end
    }

    if(x1 > x_end) {
      y1 = y_start + (x1-x_end)
      x1 = x_end
    } else {
      y1 = y_start
    }

    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()

    //console.log(x1,y1,x2,y2)
    counter += 1
  }

  ctx.beginPath()
  ctx.moveTo(x_start, y_end)
  ctx.lineTo(x_end, y_end)
  ctx.stroke()

}

function wrapText(text, maxWidth) {
  const words = text.split(" ")
  let lines = []
  let currentLine = words[0]

  for(let i = 1; i < words.length; i++) {
    let word = words[i]
    if(ctx.measureText(currentLine+" "+word).width < maxWidth) {
      currentLine += " "+word
    } else {
      lines.push(currentLine)
      currentLine = word
    }
  }
  lines.push(currentLine)
  return lines
}
