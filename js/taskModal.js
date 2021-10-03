let currentTask
let time = 0
let lastUpdate = 0
let start_time

let main = document.querySelector('main')
let sidebar = document.getElementById('sidebar')
let taskModal = document.getElementById('taskModal')
const title = taskModal.querySelector('.settings').querySelector('h1')
const title_input = taskModal.querySelector('.settings').querySelector('input[name="title"]')
const description = taskModal.querySelector('.description')
const description_textarea = taskModal.querySelector('textarea[name=description]')
const timer = taskModal.querySelector('.time')
const timer_input = taskModal.querySelector('input[name=timer]')
const timer_start_stop_button = taskModal.querySelector('button[name=startStop]')
const endTask = taskModal.querySelector('button[name=endTask]')
let timer_interval
disableModal()

//console.log(categoryColors)

document.body.addEventListener("keydown", (e) => {
  if(e.key === "Escape") {
    if(currentTask) {
      closeTaskModal()
    }
  }
})

async function updateTaskData(taskdata) {
  await updateTask(taskdata, currentTask)
  const new_task_data = await getTaskData(currentTask.ID)
  updateModal(new_task_data)
  currentTask = new_task_data
}


/* Update Modal */
async function openModal(id) {
  const task_data = await getTaskData(id)
  updateModal(task_data)
  enableModal()
  currentTask = task_data
}

async function closeTaskModal() {
  // await storeNewTitle()
  await storeNewDescription()
  // await stopTimer()
  disableModal()
  window.location.reload(true)
}


function updateModal(task) {
  document.getElementById('taskmodal_id').innerText = task.ID
  const date = new Date(task.created)
  document.getElementById('taskmodal_created').innerText = String(date.getDate()).padStart(2,"0") + '.' + String(date.getMonth() + 1).padStart(2, "0") + '.' + date.getFullYear()
  taskModal.querySelector('.header').style.backgroundColor = "#"+categoryColors.filter(cat => cat.ID === task.category)[0].color
  title.innerHTML = task.Name
  description.innerText = task.description || "No further description given..."
  printTimer(parseInt(task.time_spent))

  taskModal.querySelector('.deadline').querySelector('input[name=due-date]').value = task.due
  taskModal.querySelector('.deadline').querySelector('input[name=due-time]').value = task.due_time
  taskModal.querySelector('.deadline').querySelector('input[name=duration]').value = task.duration
  //taskModal.innerText = unescape(task.Name)
}

function enableModal() {
  start_time = undefined
  taskModal.classList.remove('disabled')
  main.classList.add('blur-out')
  sidebar.classList.add('blur-out')
}

function disableModal() {
  start_time = undefined
  taskModal.classList.add('disabled')
  main.classList.remove('blur-out')
  sidebar.classList.remove('blur-out')
}


/* Timer */
async function startStopTimer() {
  if(!start_time){
    start_time = new Date()
    timer_interval = setInterval(updateTimer, 1000)
    setButtonText("STOP")
    await startTimerOnTask(currentTask.ID)
    const task_data = await getTaskData(currentTask.ID)
    currentTask = task_data
    updateModal(task_data)
    console.log(task_data)
    //timeSpentOnTaskID(currentTask.ID)
  } else {
    stopTimer()
  }
}

async function stopTimer() {
  clearInterval(timer_interval)
  // storeTimer()
  await stopTimerOnTask(currentTask.ID)
  const task_data = await getTaskData(currentTask.ID)
  currentTask = task_data
  updateModal(task_data)
  console.log(task_data)
  start_time = undefined
  setButtonText("START")
}

function setButtonText(text) {
  timer_start_stop_button.innerText = text
}

function updateTimer() {
  let time_diff_secs = parseInt(currentTask.time_spent) + Math.floor(((new Date()).getTime() - start_time.getTime()) / 1000)
  printTimer(time_diff_secs)
}

function printTimer(seconds) {
  let secs = Math.floor(seconds % 60)
  let min = Math.floor(seconds / 60 % 60)
  let hour = Math.floor(seconds / 60 / 60)

  let timer_string = String(hour.toFixed(0)).padStart(2, "0")+":"
              +String(min.toFixed(0)).padStart(2, "0")+":"
              +String(secs.toFixed(0)).padStart(2, "0")
  timer.innerText = timer_string
}

async function storeTimer() {
  if(start_time){
    console.log("storeTimer")
    let time_diff_secs = parseInt(currentTask.time_spent) + Math.floor(((new Date()).getTime() - start_time.getTime()) / 1000)
    let new_task = JSON.parse(JSON.stringify(currentTask))
    new_task.time_spent = time_diff_secs
    await updateTaskData(new_task)
    //start_time = new Date()
    start_time = undefined
  }
}

timer_start_stop_button.addEventListener("click", startStopTimer)
//timer_stop.addEventListener("click", stopTimer)
timer.addEventListener("click", () => {
  timer.classList.add('disabled')
  timer_input.classList.remove('disabled')
  timer_input.focus()
})

timer_input.addEventListener("keypress", async (e) => {
  if(e.key === 'Enter') {
    const value = timer_input.value
    let new_task = JSON.parse(JSON.stringify(currentTask))
    if(value.charAt(0) === "+") {
      let add = parseInt(value.substring(1))
      new_task.time_spent = parseInt(new_task.time_spent) + add*60
    } else if(value.charAt(0) === "-") {
      let sub = parseInt(value.substring(1))
      new_task.time_spent = parseInt(new_task.time_spent) - sub*60
    }

    if(parseInt(new_task.time_spent) < 0)
      new_task.timer_spent = 0

    await updateTaskData(new_task)

    timer_input.classList.add('disabled')
    timer.classList.remove('disabled')
    timer_input.value = ""
  }
})
window.onbeforeunload = stopTimer


/* END TASK */
endTask.addEventListener("click", async () => {
  await stopTimerOnTask(currentTask.ID)
  await endTaskAPI(currentTask.ID)
  await closeTaskModal()
})

/* Event Listeners */
/*document.onkeydown = (e) => {
  if(e.code === "Escape" && currentTask) {
    closeTaskModal()
  }
}*/

title.addEventListener("click", () => {
  title_input.classList.remove('disabled')
  title.classList.add('disabled')
  title_input.value = currentTask.Name
  title_input.focus()
})

async function storeNewTitle() {
  console.log("Title",currentTask, title_input.value)
  const new_title = title_input.value
  if(new_title !== currentTask.Name) {
    console.log("Need to update TaskName to",new_title)
    let new_task = JSON.parse(JSON.stringify(currentTask))
    new_task.title = new_title
    await updateTaskData(new_task)
    currentTask.title = new_title
  }
  title_input.classList.add('disabled')
  title.classList.remove('disabled')
}

title_input.addEventListener("keypress", (e) => {
  if(e.key === 'Enter') {
    storeNewTitle()
  }
})

description.addEventListener("click", () => {
  description_textarea.classList.remove('disabled')
  description.classList.add('disabled')
  description_textarea.value = currentTask.description
  description_textarea.focus()
})

async function storeNewDescription() {
  console.log("Description",currentTask, description_textarea.value)
  const new_description = description_textarea.value
  if(new_description !== currentTask.description) {
    console.log("Need to update Description to",new_description)
    let new_task = JSON.parse(JSON.stringify(currentTask))
    new_task.description = new_description
    await updateTaskData(new_task)
    currentTask.description = new_description
  }
  description_textarea.classList.add('disabled')
  description.classList.remove('disabled')
}

description_textarea.addEventListener("keydown", (e) => {
  if(e.key === "Enter" && e.ctrlKey) {
    storeNewDescription()
  }
})

/* Deadline Inputs */
taskModal.querySelector('.deadline').querySelector('input[name=due-date]').addEventListener('change', async (e) => {
  let new_task = JSON.parse(JSON.stringify(currentTask))
  new_task.due = e.srcElement.value
  await updateTaskData(new_task)
})

taskModal.querySelector('.deadline').querySelector('input[name=due-time]').addEventListener('change', async (e) => {
  let new_task = JSON.parse(JSON.stringify(currentTask))
  new_task.due_time = e.srcElement.value
  await updateTaskData(new_task)
})

taskModal.querySelector('.deadline').querySelector('input[name=duration]').addEventListener('change', async (e) => {
  console.log("Change!")
  let new_task = JSON.parse(JSON.stringify(currentTask))
  new_task.duration = e.srcElement.value
  await updateTaskData(new_task)
  console.log("changed!")
})

//setInterval(()=>{time += 100; setTimer(time)}, 100)
