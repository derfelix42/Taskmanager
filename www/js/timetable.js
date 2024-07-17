const canvas = document.getElementById('timetable');
let ctx;
let interval

function decodeEntity(inputStr) {
    var textarea = document.createElement("textarea");
    textarea.innerHTML = inputStr;
    return textarea.value;
}

let settings = {
  scale: 0.9,
  starttime: 0,
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
  printing: false,
}

// Variables for storing last known Mouse-Position
let mouseX
let mouseY
let mouseHoverID

// Variables for Selection for creating new Task
let cursor_day
let cursor_hour
let cursor_select = {}

// Define Font Family
let fontfamily = "Arial"

// Default Values for currentWeek-Dates
let currentWeek = [
  {day: 0, date: "07.06.2021"},
  {day: 1, date: "08.06.2021"},
  {day: 2, date: "09.06.2021"},
  {day: 3, date: "10.06.2021"},
  {day: 4, date: "11.06.2021"},
  {day: 5, date: "12.06.2021"},
  {day: 6, date: "13.06.2021"},
]

// Default Values for WakeupTimes
let sleep_history = []
let wakeup_times = {}
let sleep_hours = {}
let bedtimes = {}

let weekSelected = "current"
let weekModifier = 0
let dateOfMonday
const daysOfWeek = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]

let tasks = []
async function setup() {
  if(canvas) {
    // Get Canvas
    ctx = canvas.getContext('2d');

    // Initial tasks
    calculateMonday()
    calculateScale()
    resizeCanvas(ctx)

    // Register Eventlistener on Window-Resize to dynamicly update rendering-scale
    window.addEventListener('resize', () => {resizeCanvas(); drawTimetable()});

    // get Data and Draw Timetable for first time
    await updateTasks()
    drawTimetable()

    // Register function to update Timetable at 60FPS
    interval = setInterval(drawTimetable, 1/60*1000);

    // Register function to update Data every 1s
    let taskupdater = setInterval(updateTasks, 1000);

    // Register Mouse-Events
    canvas.addEventListener("mousemove", mousemovement, false);
    canvas.addEventListener("mousedown", mousedown, false);
    canvas.addEventListener("mouseup", mouseup, false);

  }
}

setup()

function calculateMonday(reset=false) {
  // Current Datetime
  let d = new Date()

  if(reset) {
    php_date = ""
  }

  if(php_date !== "" && (dateOfMonday === undefined || (dateOfMonday !== undefined && php_date !== dateOfMonday.toISOString().split("T")[0])))
    d = new Date(php_date)

  // Calculate Offset to this weeks Monday
  let diff = d.getDate()-d.getDay()+(d.getDay()==0?-6:1)

  // Add/Substract one Week on Offset, depending on which week is selected
  // if(weekSelected === "last") {
  //   diff = diff-7
  // } else if(weekSelected === "next") {
  //   diff = diff+7
  // }

  // Calculate Offset depending on weekModifier (integer increments of weeks to future / past)
  diff = diff+7*weekModifier

  // Calculate Date for Monday of selected Week
  // Needed for querying the
  dateOfMonday = new Date(d.setDate(diff))
  if(config.debug)
    console.log("calculateMonday", dateOfMonday)

  // Fill 'currentWeek'-Array with date of each day
  for(let i = 0; i < 7; i++) {
    let date = new Date(dateOfMonday)
    date.setDate(date.getDate()+i)
    currentWeek[i].date = String(date.getDate()).padStart(2, "0") + '.' + String(date.getMonth() + 1).padStart(2, "0") + '.' + date.getFullYear();
  }

  php_date = dateOfMonday.toISOString().split("T")[0]

}

function calculateScale() {
  const max_width = settings.start_x-settings.overlap+settings.spacings.day*7+settings.overlap*3
  //console.log("Scale would need to be:",(ctx.canvas.clientWidth/max_width))
  const scale = ctx.canvas.clientWidth/max_width
  if(scale > 0.65) {
    settings.scale = scale
    settings.x_start = 60+60*settings.scale
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
  // console.time('drawTimetable')
  resizeCanvas()
  calculateScale()
  if(settings.printing) {
    ctx.fillStyle = "#fff"
  } else {
    ctx.fillStyle = "#222"
  }

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

  // for(let day = 0; day < 7; day++) {
  //   drawWakeUpPattern(day,wakeup_times[day])
  //   drawSleepPattern(day,bedtimes[day])
  //   printLastNightsSleep(day, sleep_hours[day])

  // }

  // wakeup_times


  for (let sleep_session of sleep_history) {
    if(sleep_session.sleep_secs > 60*30) {} // TODO: integrate in nice way - starting sleep now should invoke drawSleepPattern, but won't this way...
    
    let h = parseInt(sleep_session.wakeup_time.split(":")[0])
    let m = parseInt(sleep_session.wakeup_time.split(":")[1])
    const waketime = h + m / 60

    h = parseInt(sleep_session.sleep_time.split(":")[0])
    m = parseInt(sleep_session.sleep_time.split(":")[1])
    const sleeptime = h + m / 60

    drawSleepBlock(sleep_session.sleep_dow - 2, sleeptime, sleep_session.wakeup_dow - 2, waketime)

    // console.log(sleep_session.sleep_dow-1, sleeptime, "-", sleep_session.wakeup_dow-1, waketime)
  }

  for (let i in wakeup_times) {
    const wakeup = wakeup_times[i]
    if (wakeup >= 0) {
      drawWakeUpPattern(i, wakeup)
    }
  }

  for (let i in sleep_hours) {
    const wakeup = sleep_hours[i]
    if (wakeup >= 0) {
      drawSleepPattern(i, wakeup)
    }
  }

  // drawSleepBlock(-1,22,0,4)
  // drawSleepBlock(0,14,0,18)
  // drawSleepBlock(0,22.66666666667,1,6.783465823495)
  // drawSleepBlock(6,22,7,6)


  drawWeek(ctx)
  drawTasks()

  if(!settings.printing) {
    drawCurrentTimeBar()
    for(let day = 0; day < 7; day++) {
      printDayTasks(day, tasks.filter(task => {return (task.dayofweek === day && !task.due_time)}))
    }

    drawMouseLine()

    drawButtons()
  }

  if(settings.printing) {
    ctx.fillStyle = '#000';
  } else {
    ctx.fillStyle = '#fff';
  }

  ctx.font = 18*settings.scale+"px "+fontfamily
  const text = getCurrentWeekNumber()
  ctx.fillText(text, settings.start_x+settings.spacings.day*7*settings.scale+settings.overlap*3*settings.scale-ctx.measureText(text).width, 14)

  if(mouseHoverID === -1) {
    drawSelectionRect()

  }

  // console.timeEnd('drawTimetable')
}

document.addEventListener("keydown", async (e) => {
  if(e.ctrlKey && e.key === "p") {
    e.preventDefault()
    print_canvas()
  }
});
document.getElementById('printTimetableButton')?.addEventListener("click", () => {
  print_canvas()
})

function print_canvas() {
  console.log("print!")
  settings.printing = true
  drawTimetable()
  let win = window.open('about:blank',"window", 'width=1350,height=750');
  // win.document.write("<h1>Halloo Welt!</h1>")
  win.document.write("<br><img src = '"+canvas.toDataURL()+"'/>");
  settings.printing = false
}


function drawButtons() {
  let x_start = 100
  let y_start = 5
  ctx.font = "12px "+fontfamily
  ctx.textAlign = "center"

  let weeks = ["<", "current Week", ">"]

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
  let weeks = ["prev Week", "current Week", "next Week"]

  for(let index in weeks) {
    let title = weeks[index]
    let x1 = x_start+(index*150)
    let y1 = y_start
    let x2 = x_start+120+(index*150)
    let y2 = y_start+30

    if(mouseX > x1 && mouseX < x2 && mouseY > y1 && mouseY < y2) {
      weekSelected = title.split(" ")[0]
      if(title.split(" ")[0] === "next") {
        weekModifier += 1
      } else if(title.split(" ")[0] === "prev") {
        weekModifier += -1
      } else {
        weekModifier = 0
        calculateMonday(true)
      }
      console.log(weekModifier)

      calculateMonday()
      updateTasks()
      //console.log("Button",index, weekSelected)
      window.history.pushState("Test", "Change of Week", "tasks.php?timetable&date="+dateOfMonday.toISOString().split('T')[0]);
    }
  }
}

async function getTasks(date) {
  date = date.toISOString().split('T')[0]
  const res = await fetch("api/getWeeksTasks.php?date="+date);
  let json = await res.json()
  if(config.debug) {
    console.log("api/getWeeksTasks.php?date="+date, json)
  }

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
  if(config.debug) {
    console.log(json)
  }
  return json
}

async function updateTasks() {
  tasks = await getTasks(dateOfMonday)
  loadWakeupTimes()
}

async function loadWakeupTimes() {
  data = await getWakeupTimes(dateOfMonday)
  if (config.debug)
    console.log(data)

  sleep_history = data.data;

  wakeup_times = {
    0: 6,
    1: 6,
    2: 6,
    3: 6,
    4: 6,
    5: 7,
    6: 7,
  }

  sleep_hours = {
    0: 22,
    1: 22,
    2: 22,
    3: 22,
    4: 22,
    5: 22,
    6: 22,
  }

  for (let session of sleep_history) {
    wakeup_times[session.wakeup_dow - 2] = -1
    sleep_hours[session.sleep_dow - 2] = -1
  }
}

function drawTasks() {
  tasks.forEach(task => {
    if(task.due && (task.time_spent >= 600 || parseInt(task.time_spent) === 0))  {
      let ob = {name: task.Name, day: task.dayofweek, startTime: parseFloat(task.start), endTime: parseFloat(task.end), color: "#"+task.color, done: task.bool_done, location: task.location, priority: task.priority}
      // console.log(ob)
      drawTask(ob, task)
    }
  })
}


function resizeCanvas() {
  const clientHeight = ctx.canvas.clientHeight
  const clientWidth = ctx.canvas.clientWidth

  ctx.canvas.height = clientWidth / 1.8
  ctx.canvas.width = clientWidth
}

function drawWeek(ctx) {
  if(settings.printing) {
    ctx.strokeStyle = '#000';
    ctx.fillStyle = '#000';
  } else {
    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#ffffff';
  }
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
  ctx.font = (settings.fontsize*settings.scale)+"px "+fontfamily
  if(settings.printing) {
    ctx.fillStyle = '#000';
  } else {
    ctx.fillStyle = '#ffffff';
  }
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

function drawTask(task, orig_task) {
  const day = task.day;
  const startTime = task.startTime
  const endTime = task.endTime
  const color = task.color
  const location = task.location
  let name = decodeEntity(task.name)
  if(task.priority >= 10) {
    // name += "❗"
  }

  // TODO: Sollte später in dem task-Objekt mit übergeben werden, damit Box-Collisions erkannt werden können -> Hover-Menüs etc
  const x_start = settings.start_x+day*settings.spacings.day*settings.scale
  const x_end = settings.start_x+(day+1)*settings.spacings.day*settings.scale
  const y_start = settings.start_y+(startTime-settings.starttime)*settings.spacings.hour*settings.scale
  const y_end = settings.start_y+(endTime-settings.starttime)*settings.spacings.hour*settings.scale
  if(!orig_task.position) {
    orig_task.position = {}
  }
  orig_task.position.x_start = x_start
  orig_task.position.x_end = x_end
  orig_task.position.y_start = y_start
  orig_task.position.y_end = y_end

  const height = y_end - y_start
  const width = x_end - x_start

  const x_center = x_start + width/2
  const y_center = y_start + height/2

  let margin = 2

  //Draw Rect with Border
  if(settings.printing) {
    ctx.fillStyle = "#ccc";
    ctx.fillRect(x_start, y_start, width, height)
    ctx.lineWidth = margin/2;
    ctx.strokeStyle = "rgba(0,0,0,1)";
    ctx.strokeRect(x_start, y_start, width, height)
  } else {
    ctx.fillStyle = color;
    ctx.fillRect(x_start+margin, y_start+margin, width-2*margin, height-2*margin)
    ctx.lineWidth = margin/2;
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.strokeRect(x_start+margin, y_start+margin, width-2*margin, height-2*margin)
  }

  //Write Name of Task
  let lines = wrapText(name, settings.spacings.day*settings.scale-2*margin-5)
  const possibleLineCount = height / (settings.fontsize*2*settings.scale)
  //console.log(lines, height, settings.fontsize*2*settings.scale, possibleLineCount)
  ctx.font = (settings.fontsize*settings.scale)+"px "+fontfamily

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
    ctx.fillText(line, x_center, text_start_y+settings.fontsize*index*settings.scale)
  })

  //Write Location if existing
  if(location) {
    //console.log(location)
    ctx.font = (settings.fontsize*settings.scale*0.6)+"px "+fontfamily
    ctx.textAlign = "left"
    ctx.fillStyle = invertColor(color, true)
    ctx.fillText(location, x_start+4,y_end-settings.fontsize*settings.scale*0.5*0.6-3)
  }
}

function invertColor(hex, bw) {
    if(settings.printing) {
      return "#000"
    }

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


function printDayTasks(day, list) {
  //console.log(list)
  const x_start = settings.start_x+day*settings.spacings.day*settings.scale
  const x_end = settings.start_x+(day+1)*settings.spacings.day*settings.scale
  const y_start = settings.start_y+(settings.endtime-settings.starttime)*settings.spacings.hour*settings.scale+settings.spacings.hour

  let currY = y_start

  ctx.font = (settings.small_fontsize*settings.scale)+"px "+fontfamily
  if(settings.printing) {
    ctx.fillStyle = "#000"
  } else {
    ctx.fillStyle = "#fff"
  }
  ctx.textAlign="left";
  ctx.textBaseline = "top";

  let radius = settings.small_fontsize/4

  list.forEach((task, index) => {
    let text = decodeEntity(task.Name)//+(task.bool_done?" ✓":"")
    if(task.priority >= 10) {
      text += " ❗"
    }
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
  mouseX = e.clientX - canvas.offsetLeft;
  mouseY = e.clientY - canvas.offsetTop;
  // console.log(mouseX, mouseY)

  cursor_day = Math.floor((mouseX - settings.start_x) / (settings.spacings.day*settings.scale))
  cursor_hour = settings.starttime+((mouseY - settings.start_y) / (settings.spacings.hour*settings.scale))
  if(cursor_hour > settings.endtime || cursor_hour < settings.starttime) {
    cursor_hour = -1
  }
  // console.log(day, hour)

  mouseHoverID = -1
  // console.log(tasks)
  for(let task of tasks.filter(t => (t.DOW-2+7)%7 === cursor_day)) {
    if(task.position) {
      if(task.position.x_start < mouseX && mouseX < task.position.x_end && task.position.y_start < mouseY && mouseY < task.position.y_end) {
        mouseHoverID = task.ID
      }
    }
  }

  if(mouseHoverID !== -1) {
    // console.log(mouseHoverID, tasks.filter(t=>t.ID === mouseHoverID)[0].Name)
  }
}

function mousedown(e) {
  //console.log(e)
  checkButtonClick()

  // Open TaskModal if task is clicked
  if(mouseHoverID !== -1) {
    console.log("Opening task with id", mouseHoverID)
    openModal(mouseHoverID)
  }

  if(mouseHoverID === -1) {
    cursor_select.day_start = cursor_day
    cursor_select.hour_start = Math.floor(cursor_hour * 2) / 2
  }
}

function mouseup(e) {
  console.log("MouseUP!")
  
  if(mouseHoverID !== -1) {
    return 
  }

    
  let day_start = cursor_select.day_start
  let day_end = cursor_day
  let hour_start = Math.floor(cursor_select.hour_start * 2) / 2
  let hour_end = Math.floor(cursor_hour * 2) / 2
  if(hour_start > hour_end) {
    hour_start = hour_end - 1
    hour_end = Math.floor(cursor_select.hour_start * 2) / 2 + 0.5
  } else {
    hour_end += 0.5
  }
  
  cursor_select.hour_end = hour_end
  cursor_select.day_end = day_end
  
  cursor_select.duration = hour_end - hour_start
  
  console.log(cursor_select)
  if(day_start >= 0 && day_end >= 0 && hour_start >= 0 && hour_end >= 0) {
    console.log("From day",day_start,"at",hour_start,"to",day_end,"at",hour_end)
  
    openNewTaskModal()
  }


  cursor_select = {}
}

function openNewTaskModal() {
  // let modal = new addNewTaskModal()
  modal.open()

  let sel_date = currentWeek[cursor_select.day_start].date
  let due_date = sel_date.substring(6,10)+"-"+sel_date.substring(3,5)+"-"+sel_date.substring(0,2)
  let due_time = Math.floor(settings.starttime+cursor_select.hour_start-settings.starttime).toString().padStart(2, '0')+":"+(((cursor_select.hour_start-settings.starttime)%1)*60).toString().padStart(2, '0')+":00"
  let duration = Math.floor(cursor_select.duration).toString().padStart(2, '0')+":"+((cursor_select.duration%1)*60).toString().padStart(2, '0')+":00"

  modal.due_date.value = due_date
  modal.due_time.value = due_time
  modal.duration.value = duration

}

function drawSelectionRect() {
  if(cursor_select.hour_start === undefined) {
    let h = Math.floor((cursor_hour-settings.starttime) * 2) / 2
    let x_start = settings.start_x+cursor_day*settings.spacings.day*settings.scale
    let y_start = settings.start_y+h*settings.spacings.hour*settings.scale
    let width = settings.spacings.day*settings.scale
    let height = settings.spacings.hour / 2 * settings.scale
    let margin = 2
  
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fillRect(x_start+margin, y_start+margin, width-2*margin, height-2*margin)
  } else {
    let hour_start = Math.floor(cursor_select.hour_start * 2) / 2 - settings.starttime
    let hour_end = Math.floor(cursor_hour * 2) / 2 - settings.starttime
    if(hour_start > hour_end) {
      hour_start = hour_end
      hour_end = Math.floor(cursor_select.hour_start * 2) / 2 + 0.5 - settings.starttime
    } else {
      hour_end += 0.5
    }
    let duration = hour_end - hour_start

    // console.log(hour_start, hour_end, duration)

    let x_start = settings.start_x+cursor_day*settings.spacings.day*settings.scale
    let y_start = settings.start_y+hour_start*settings.spacings.hour*settings.scale
    let width = settings.spacings.day*settings.scale
    let height = duration * settings.spacings.hour * settings.scale
    let margin = 2
  
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fillRect(x_start+margin, y_start+margin, width-2*margin, height-2*margin)
  }
}

function drawMouseLine() {
  if(mouseX > settings.start_x &&
    mouseY > settings.start_y &&
    mouseY < settings.start_y+(settings.endtime-settings.starttime)*settings.spacings.hour*settings.scale &&
    mouseX < settings.start_x+(settings.spacings.day*7*settings.scale)
  ){
    ctx.strokeStyle = "#f00"
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(settings.start_x-settings.overlap/2, mouseY);
    ctx.lineTo(settings.start_x, mouseY);
    ctx.stroke();
  }
}

function drawCurrentTimeBar() {
  if(weekModifier === 0) {
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

  ctx.lineWidth = 1.5;
  if(settings.printing) {
    ctx.strokeStyle = "#000"
  } else {
    ctx.strokeStyle = "#666"
  }

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
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()

    //console.log(x1,y1,x2,y2)
    counter += 1
  }
}

function drawSleepBlock(start_day, start_time, end_day, end_time) {
  if (start_day >= 0) {
    let tmp_end_time = end_time
    if (start_day !== end_day) {
      tmp_end_time = 24
    }
    const x_start = settings.start_x + start_day * settings.spacings.day * settings.scale
    const y_start = settings.start_y + (start_time - settings.starttime) * settings.spacings.hour * settings.scale
    const y_end = settings.start_y + (tmp_end_time - settings.starttime) * settings.spacings.hour * settings.scale

    const height = y_end - y_start
    const width = settings.spacings.day * settings.scale

    ctx.fillStyle = "#181818";
    ctx.fillRect(x_start, y_start, width, height)
  }

  if (start_day !== end_day && end_day < 7) {
    let tmp_start_time = 0

    const x_start = settings.start_x + end_day * settings.spacings.day * settings.scale
    const y_start = settings.start_y + (tmp_start_time - settings.starttime) * settings.spacings.hour * settings.scale
    const y_end = settings.start_y + (end_time - settings.starttime) * settings.spacings.hour * settings.scale

    const height = y_end - y_start
    const width = settings.spacings.day * settings.scale

    ctx.fillStyle = "#181818";
    ctx.fillRect(x_start, y_start, width, height)
  }

  if (start_day >= 0) {
    drawSleepPattern(start_day, start_time)
  }

  if (end_day < 7) {
    drawWakeUpPattern(end_day, end_time)
  }

}


function drawWakeUpPattern(day, time) {
  day = parseInt(day)
  const margin = settings.spacings.day * settings.scale / 12
  const x_start = settings.start_x +     day    * settings.spacings.day * settings.scale
  const x_end = settings.start_x + (day + 1) * settings.spacings.day * settings.scale
  const y_start = settings.start_y + (time - 0.5 - settings.starttime) * settings.spacings.hour * settings.scale
  const y_end = settings.start_y + (time - settings.starttime) * settings.spacings.hour * settings.scale

  // const width = x_end - x_start
  // if (width > settings.spacings.day * settings.scale) {
  //   console.log("Möp!", width, settings.spacings.day * settings.scale)
  // }

  const height = y_end - y_start

  ctx.lineWidth = 2;
  if (settings.printing) {
    ctx.strokeStyle = "#000"
  } else {
    ctx.strokeStyle = "#fff"
  }

  let x1 = x_start
  let x2 = x_end - height
  let y1 = y_start
  let y2 = y_end

  let counter = 0

  while (x2 + margin <= x_end + 1 && counter < 1000) {
    x1 = x_start + (counter * margin)
    x2 = x1 - height

    if (x2 < x_start) {
      y2 = y_end - x_start + x2
      x2 = x_start
    } else {
      y2 = y_end
    }

    if (x1 > x_end) {
      y1 = y_start + (x1 - x_end)
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

function drawSleepPattern(day, time) {
  day = parseInt(day)
  if (time === 24)
    return
  const margin = settings.spacings.day * settings.scale / 12
  const x_start = settings.start_x + day * settings.spacings.day * settings.scale
  const x_end = settings.start_x + (day + 1) * settings.spacings.day * settings.scale
  const y_start = settings.start_y + (time - settings.starttime) * settings.spacings.hour * settings.scale
  const y_end = settings.start_y + (time + 0.5 - settings.starttime) * settings.spacings.hour * settings.scale

  const height = y_end - y_start

  ctx.lineWidth = 2;
  if (settings.printing) {
    ctx.strokeStyle = "#000"
  } else {
    ctx.strokeStyle = "#fff"
  }

  let x1 = x_start
  let x2 = x_end - height
  let y1 = y_start
  let y2 = y_end

  let counter = 0

  while (x2 + margin <= x_end + 1 && counter < 1000) {
    x1 = x_start + (counter * margin)
    x2 = x1 - height

    if (x2 < x_start) {
      y2 = y_end - x_start + x2
      x2 = x_start
    } else {
      y2 = y_end
    }

    if (x1 > x_end) {
      y1 = y_start + (x1 - x_end)
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
  ctx.moveTo(x_start, y_start)
  ctx.lineTo(x_end, y_start)
  ctx.stroke()

}

function printLastNightsSleep(day, sleep) {

  ctx.font = (0.7*settings.small_fontsize*settings.scale)+"px "+fontfamily
  if(settings.printing) {
    ctx.fillStyle = '#000';
  } else {
    ctx.fillStyle = '#ffffff';
  }
  ctx.textAlign="right";
  ctx.textBaseline = "bottom";

  let text = ""
  if(sleep !== undefined && sleep !== "")
    text = "("+sleep.split(":")[0]+":"+sleep.split(":")[1]+")"
  let right_x = settings.start_x+settings.spacings.day*settings.scale*day+settings.spacings.day*settings.scale-settings.overlap*0.1
  let bottom_y = settings.start_y//-settings.spacings.hour*settings.scale*2+8*settings.scale
  ctx.fillText(text, right_x, bottom_y);
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
