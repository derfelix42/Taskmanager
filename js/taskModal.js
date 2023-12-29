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
const task_location = taskModal.querySelector('.location')
const task_location_input = taskModal.querySelector('.settings').querySelector('input[name="location"]')

const timer = taskModal.querySelector('.time')
const timer_input = taskModal.querySelector('input[name=timer]')
const timer_start_stop_button = taskModal.querySelector('button[name=startStop]')
const endTask = taskModal.querySelector('button[name=endTask]')
const resetTimer = taskModal.querySelector('button[name=resetTimer]')
const category = taskModal.querySelector('select[name=category]')
const priority = taskModal.querySelector('select[name=priority]')
const difficulty = taskModal.querySelector('select[name=difficulty]')

let timer_interval
disableModal()

//console.log(categoryColors)

document.body.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (currentTask) {
      closeTaskModal()
    }
  }
})

async function deleteTask() {
  let newTask = JSON.parse(JSON.stringify(currentTask))
  newTask.deleted = 1
  await updateTask(newTask, currentTask)
  closeTaskModal()
}

async function updateTaskData(taskdata) {
  await updateTask(taskdata, currentTask)
  const new_task_data = await getTaskData(currentTask.ID)
  updateModal(new_task_data)
  currentTask = new_task_data
}


/* Update Modal */
async function openModal(id) {
  id = parseInt(id)
  const task_data = await getTaskData(id)
  const notes = await getTaskNotes(id)
  task_data.notes = notes
  updateModal(task_data)
  enableModal()
  currentTask = task_data
  const runningTask = parseInt(await getCurrentlyActiveTask())
  console.log(id, runningTask)
  if (id === runningTask) {
    console.log("We are running right now!")
    startStopTimer()

  }
}

async function closeTaskModal() {
  // await storeNewTitle()
  await storeNewDescription()
  // await stopTimer()
  disableModal()
  window.location.reload(true)
}

function fillCategorySelectorAndSelect(selected) {
  // if(category) {
  //   category.childNodes.forEach((child) => {
  //     category.removeChild(child)
  //   })
  // }
  if (category.childNodes.length > 0) {
    for (let opt of category.childNodes) {
      if (opt.value === selected) {
        opt.selected = true
      } else {
        opt.selected = false
      }
    }
  } else {
    for (let cat of categoryColors) {
      let opt = document.createElement('option')
      if (cat.ID === selected)
        opt.selected = true
      opt.value = cat.ID
      opt.innerText = cat.ID + " - " + cat.Bezeichnung
      category.appendChild(opt)
    }
  }
}



function fillPrioritySelectorAndSelect(selected) {
  console.log("priority:", selected)
  if (priority.childNodes.length > 0) {
    for (let opt of priority.childNodes) {
      if (opt.value === selected) {
        opt.selected = true
      } else {
        opt.selected = false
      }
    }
  } else {
    for (let i = 10; i >= 1; i--) {
      let opt = document.createElement('option')
      opt.value = i
      opt.innerText = i
      if (i === parseInt(selected))
        opt.selected = true
      if (i === 1) {
        opt.innerText = "1 - Niedrig"
      } if (i === 5) {
        opt.innerText = "5 - Normal"
      } if (i === 10) {
        opt.innerText = "10 - Hoch"
      }
      priority.appendChild(opt)
    }
  }
}

function fillDifficultySelectorAndSelect(selected) {
  console.log("difficulty:", selected)
  if (difficulty.childNodes.length > 0) {
    for (let opt of difficulty.childNodes) {
      if (opt.value === selected) {
        opt.selected = true
      } else {
        opt.selected = false
      }
    }
  } else {
    for (let i = 5; i >= 1; i--) {
      let opt = document.createElement('option')
      opt.value = i
      opt.innerText = i
      if (i === parseInt(selected))
        opt.selected = true
      if (i === 1) {
        opt.innerText = "1 - Easy"
      } if (i === 5) {
        opt.innerText = "5 - Hard"
      }
      difficulty.appendChild(opt)
    }
  }
}

function updateModal(task) {
  console.log(task)
  document.getElementById('taskmodal_id').innerText = task.ID
  const date = new Date(task.created)
  document.getElementById('taskmodal_created').innerText = String(date.getDate()).padStart(2, "0") + '.' + String(date.getMonth() + 1).padStart(2, "0") + '.' + date.getFullYear()
  taskModal.querySelector('.header').style.backgroundColor = "#" + categoryColors.filter(cat => cat.ID === task.category)[0].color
  title.innerHTML = task.Name
  description.innerText = task.description || "No further description given..."
  description_textarea.value = task.description
  task_location.innerText = task.location || ""
  printTimer(parseInt(task.time_spent))

  taskModal.querySelector('.notes').querySelector('.title').innerText = task.Name
  if (task.notes) {
    const converter = new showdown.Converter({ tasklists: true, simpleLineBreaks: true, strikethrough: true, noHeaderId: true, disableForced4SpacesIndentedSublists: true })
    taskModal.querySelector('.notes').querySelector('.title').innerText = task.Name+" | "+task.notes.created.split(" ")[0]
    taskModal.querySelector('.notes').querySelector('p').innerHTML = converter.makeHtml(task.notes.note);
    taskModal.querySelector('.notes').querySelector('textarea').value = task.notes.note
  }

  taskModal.querySelector('.deadline').querySelector('input[name=due-date]').value = task.due
  taskModal.querySelector('.deadline').querySelector('input[name=due-time]').value = task.due_time
  taskModal.querySelector('.deadline').querySelector('input[name=duration]').value = task.duration
  fillCategorySelectorAndSelect(task.category)
  fillPrioritySelectorAndSelect(task.priority)
  fillDifficultySelectorAndSelect(task.difficulty)
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

function openNotes() {
  taskModal.querySelector('.notes').classList.remove("disabled")
}

function closeNotes() {
  taskModal.querySelector('.notes').classList.add("disabled")
}

function toggleNotes() {
  if(taskModal.querySelector('.notes').classList.contains("disabled")) {
    openNotes()
  } else {
    closeNotes()
  }
}

function taskNoteEdit() {
  taskModal.querySelector('.notes').classList.add("edit")
  taskModal.querySelector('.notes').querySelector("textarea").focus()
}

async function saveChangesToNotes() {
  const text = taskModal.querySelector('.notes').querySelector('textarea').value
  await updateTaskNotes(currentTask.ID, text)

  currentTask.notes = await getTaskNotes(currentTask.ID)
  updateModal(currentTask)

  taskModal.querySelector('.notes').classList.remove("edit")
}

taskModal.querySelector('.notes').querySelector('textarea').addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.ctrlKey) {
    saveChangesToNotes()
  }
})


/* Timer */
async function startStopTimer() {
  if (!start_time) {
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
  // throw new Error("taskModal.js: stopTimer() got called!")
  if(currentTask?.ID) {
    await stopTimerOnTask(currentTask.ID)
    const task_data = await getTaskData(currentTask.ID)
    currentTask = task_data
    updateModal(task_data)
    console.log(task_data)
  }
  start_time = undefined
  setButtonText("START")
}

function setButtonText(text) {
  timer_start_stop_button.innerText = text
}

function updateTimer() {
  if(timer_interval && start_time) {
    let time_diff_secs = parseInt(currentTask.time_spent) + Math.floor(((new Date()).getTime() - start_time.getTime()) / 1000)
    printTimer(time_diff_secs)
  }
}

function printTimer(seconds) {
  let secs = Math.floor(seconds % 60)
  let min = Math.floor(seconds / 60 % 60)
  let hour = Math.floor(seconds / 60 / 60)

  let timer_string = String(hour.toFixed(0)).padStart(2, "0") + ":"
    + String(min.toFixed(0)).padStart(2, "0") + ":"
    + String(secs.toFixed(0)).padStart(2, "0")
  timer.innerText = timer_string
}

async function storeTimer() {
  if (start_time) {
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
  if (e.key === 'Enter') {
    const value = timer_input.value
    let new_task = JSON.parse(JSON.stringify(currentTask))
    if (value.charAt(0) === "+") {
      let add = parseInt(value.substring(1))
      new_task.time_spent = parseInt(new_task.time_spent) + add * 60
    } else if (value.charAt(0) === "-") {
      let sub = parseInt(value.substring(1))
      new_task.time_spent = parseInt(new_task.time_spent) - sub * 60
    }

    if (parseInt(new_task.time_spent) < 0)
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

/* Reset Timer */
resetTimer.addEventListener("click", async () => {
  await resetTimerOnTask(currentTask.ID)
  openModal(currentTask.ID)
})

/* Event Listeners */
/*document.onkeydown = (e) => {
  if(e.code === "Escape" && currentTask) {
    closeTaskModal()
  }
}*/

// Change Name of Task
title.addEventListener("click", () => {
  title_input.classList.remove('disabled')
  title.classList.add('disabled')
  title_input.value = decodeEntity(currentTask.Name)
  title_input.focus()
})

async function storeNewTitle() {
  console.log("Title", currentTask, title_input.value)
  const new_title = title_input.value
  if (new_title !== currentTask.Name) {
    console.log("Need to update TaskName to", new_title)
    let new_task = JSON.parse(JSON.stringify(currentTask))
    new_task.Name = new_title
    await updateTaskData(new_task)
    currentTask.Name = new_title
  }
  title_input.classList.add('disabled')
  title.classList.remove('disabled')
}

title_input.addEventListener("keypress", (e) => {
  if (e.key === 'Enter') {
    storeNewTitle()
  }
})


// Store new Description
description.addEventListener("click", () => {
  description_textarea.classList.remove('disabled')
  description.classList.add('disabled')
  description_textarea.value = currentTask.description
  description_textarea.focus()
})

async function storeNewDescription() {
  console.log("Description", currentTask, description_textarea.value)
  const new_description = description_textarea.value
  if (new_description !== currentTask.description) {
    console.log("Need to update Description to", new_description)
    let new_task = JSON.parse(JSON.stringify(currentTask))
    new_task.description = new_description
    await updateTaskData(new_task)
    currentTask.description = new_description
  }
  description_textarea.classList.add('disabled')
  description.classList.remove('disabled')
}

description_textarea.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.ctrlKey) {
    storeNewDescription()
  }
})

// Store new Location
task_location.addEventListener("click", (e) => {
  if (e.ctrlKey && task_location.innerText !== "") {
    window.open(task_location.innerText, '_blank')
  } else {
    task_location_input.classList.remove('disabled')
    task_location.classList.add('disabled')
    task_location_input.value = currentTask.location
    task_location_input.focus()
  }
})

async function storeNewLocation() {
  console.log("Location", currentTask, task_location_input.value)
  const new_location = task_location_input.value
  if (new_location !== currentTask.location) {
    console.log("Need to update Task Location to", new_location)
    let new_task = JSON.parse(JSON.stringify(currentTask))
    new_task.location = new_location
    await updateTaskData(new_task)
    currentTask.location = new_location
  }
  task_location_input.classList.add('disabled')
  task_location.classList.remove('disabled')
}

task_location_input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.ctrlKey) {
    storeNewLocation()
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

category.addEventListener("change", async (e) => {
  console.log("[TaskModal] Category Changed!")
  let new_task = JSON.parse(JSON.stringify(currentTask))
  new_task.category = e.srcElement.value
  await updateTaskData(new_task)
  console.log("changed!")
})

priority.addEventListener("change", async (e) => {
  console.log("[TaskModal] Priority Changed!")
  let new_task = JSON.parse(JSON.stringify(currentTask))
  new_task.priority = e.srcElement.value
  await updateTaskData(new_task)
  console.log("changed!")
})

difficulty.addEventListener("change", async (e) => {
  console.log("[TaskModal] Difficulty Changed!")
  let new_task = JSON.parse(JSON.stringify(currentTask))
  new_task.difficulty = e.srcElement.value
  await updateTaskData(new_task)
  console.log("changed!")
})

//setInterval(()=>{time += 100; setTimer(time)}, 100)
