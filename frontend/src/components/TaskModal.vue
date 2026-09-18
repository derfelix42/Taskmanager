<script setup lang="ts">
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
  taskModal.querySelector('.header').style.backgroundColor = "#" + categoryColors.filter(cat => cat.ID === parseInt(task.category))[0].color
  title.innerHTML = task.Name
  description.innerText = task.description || "No further description given..."
  description_textarea.value = task.description
  task_location.innerText = task.location || ""
  printTimer(parseInt(task.time_spent))

  taskModal.querySelector('.notes').querySelector('.title').innerText = task.Name
  if (task.notes) {
    const converter = new showdown.Converter({ tasklists: true, simpleLineBreaks: true, strikethrough: true, noHeaderId: true, disableForced4SpacesIndentedSublists: true })
    taskModal.querySelector('.notes').querySelector('.title').innerText = task.Name + " | " + task.notes.created.split(" ")[0]
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
  if (taskModal.querySelector('.notes').classList.contains("disabled")) {
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
  if (currentTask?.ID) {
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
  if (timer_interval && start_time) {
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

</script>

<template>
  <div id="taskModal" class="taskModal disabled">
    <div class="container">
      <div class="header">
        <p class="small" onclick="deleteTask()"><i class="fas fa-trash"></i></p>
        Aufgabe <p id="taskmodal_id">ID</p> bearbeiten (<p id="taskmodal_created"></p>)
        <p class="float-right" onclick="closeTaskModal()">[X]</p>
        <p class="small float-right" onclick="toggleNotes()">
          <i class="fas fa-book"></i>
        </p>
      </div>
      <div class="main">
        <div class="settings flex-one">
          <h1 class="flex-two">Titel</h1>
          <input type="text" name="title" value="title" class="disabled bigInput">
          <p class="description flex-one"></p>
          <textarea name="description" rows="4" cols="80" class="disabled flex-one"></textarea>
          <h1 class="smallInput location">Location</h1>
          <input class="disabled smallInput" type="text" name="location" placeholder="Location">
        </div>
        <hr>
        <div class="deadline">
          <label>Deadline: <input type="date" name="due-date"><input type="time" name="due-time"></label>
          <label>Duration: <input type="time" name="duration"></label>
          <label>Category: <select class="mobilBigInput" name="category"></select></label>
          <label>Priority: <select class="mobilBigInput" name="priority"></select></label>
          <label>Difficulty: <select class="mobilBigInput" name="difficulty"></select></label>
        </div>
        <hr>
        <div class="timer">
          <div class="time">00:00:00</div>
          <input class="time disabled" type="text" name="timer" value="" placeholder="Add/Substract Time in Seconds">
          <div class="buttonGroup">
            <button type="button" name="startStop">START</button>
            <button type="button" name="resetTimer"><i class="fa fa-redo"></i></button>
          </div>
          <button type="button" name="endTask">Aufgabe beenden</button>
        </div>
      </div>
    </div>
    <div class="side right notes disabled">
      <h1 class="title"></h1>
      <p class="content flex-one" onclick="taskNoteEdit()"></p>
      <textarea class="content"></textarea>
    </div>
    <!-- <div class="side left notes">
      <textarea id="task_notes"></textarea>
    </div> -->
  
  </div>
</template>

<style>
.blur-out {
  filter: blur(0.5em);
}
.disabled {
  display: none !important;
}

.flex-one {
  flex: 1;
}

.taskModal {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 30em;
  height: 40em;
  margin-left: -15em;
  margin-top: -20em;
  
}

.taskModal .container {
  position: relative;
  background-color: #333;
  border-radius: 1em;
  z-index: 10;
}

.taskModal .header {
  position: relative;
  background-color: black;
  height: 3em;
  line-height: 2em;
  border-radius: 1em 1em 0 0;
  padding: 0.5em 1em;
  font-size: 1em;
  z-index: 10;
}

.taskModal .main {
  position: relative;
  height: 37em;
  display: flex;
  flex-direction: column;
  z-index: 10;
}

.taskModal .header p.float-right {
  cursor: pointer;
  float: right;
  margin-left: 0.5em;
}

.taskModal .settings {
  padding: 1em;
  display: flex;
  flex-direction: column;
}

.taskModal .settings h1 {
  line-height: 1em;
  font-size: 2em;
  cursor: pointer;
  transition: ease .2s;
  padding: 0.2em;
  width: 100%;
  min-height: 1.4em;
}

.taskModal .settings h1:hover {
  font-weight: 800;
  background-color: #444;
}

.taskModal .settings input[type=text] {
  line-height: 1em;
  font-size: 2em;
  font-family: monospace;
  font-weight: 700;

  height: 1.4em;
  border: 0;
  border-bottom: 1px solid black;
  padding: 0.2em;
  background-color: #555;
  color: white;
  outline: none;
}

.taskModal .settings input[type=text],textarea::placeholder {
  color: white;
  opacity: 0.8;
}


.taskModal .settings p {
  width: 28em;
  height: 20em;
}

.taskModal p.description {
  display: inline-block;
  margin-top: 0.5em;
  width: 28em;
  padding: 0.4em;
  color: white;
  overflow-y: auto;
  cursor: pointer;
  transition: ease .2s;
  white-space: pre-wrap;
}

.taskModal p.description:hover {
  font-weight: 700;
  background-color: #444;
}

.taskModal textarea {
  margin-top: 0.5em;
  padding: 0.4em;
  background-color: #555;
  color: white;
  outline: none;
  resize: none;
}

.taskModal .deadline {
  padding: 1em;
}

.taskModal .deadline label {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  line-height: 1.5em;
  margin-bottom: 0.2em;
  width: 100%;
}

.taskModal .deadline input {
  margin-left: 0.5em;
}

.taskModal .deadline select {
  width: 100%;
  margin-left: 0.5em;
}

.taskModal .settings {
  padding: 1em;
}

.taskModal .settings label {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  line-height: 1.5em;
  margin-bottom: 0.2em;
  width: 100%;
}

.taskModal .settings select {
  margin-left: 0.5em;
  width: 100%;
}

.taskModal .timer {
  padding: 1em;
  text-align: center;
  vertical-align: bottom;
}

.taskModal .save {
  padding: 1em;
  text-align: center;
  vertical-align: bottom;
}

.taskModal hr {
  vertical-align: bottom;
}

.taskModal button {
  display: inline-block;
  width: 98%;
  height: 2em;
  color: white;
  border: 0;
  font-weight: bolder;
  background-color: RED;
  margin-bottom: 0.5em;
  cursor: pointer;
}

.taskModal button[name=startStop] {
  margin-left: 0.25em;
}

.taskModal button[name=endTask] {
  background-color: GREEN;
}

.taskModal button[name=save] {
  background-color: GREEN;
}

.taskModal button[name=save-and-start] {
  background-color: GREY;
}

.taskModal button[name=resetTimer] {
  background-color: GREY;
  width: 3em;
  transform: scale(-1, 1);
  margin-left: 0.25em;
  margin-right: 0.25em;
}

.taskModal .buttonGroup {
  /* width: 98%; */
  display: flex;
  align-items: center;
  margin: 0;
}

.taskModal .timer .time {
  display: inline-block;
  width: 98%;
  height: 2em;
  line-height: 2em;
  background-color: #555;
  margin-bottom: 0.25em;
  font-size: 2em;
  color: white;
}

.smallInput {
  margin-top: 0.25em;
  font-size: 1.4em !important;
}

/* Extra small screen / smartphone / 280px to 479px */
@media only screen and (max-width: 980px) {
  .taskModal {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    margin-left: 0;
    margin-top: 0;
  }

  .mobilBigInput {
    font-size: 1.5em;
    line-height: 1em;
  }
}

.taskModal .bigInput {
  font-size: 1.5em;
  line-height: 1em;
}

.margin-left {
  margin-left: 0.5em;
}

.padding {
  padding: 1em;
}

.taskModal .side {
  position: relative;
  width: 30em;
  height: 40em;
  top: -40em;
  background-color: #282828;
  z-index: 5;
  display: flex;
  flex-direction: column;
}

.taskModal .side.right {
  padding: 1em 1em 1em 2em;
  margin-left: -1em;
  left: 30em;
  border-radius: 0 1em 1em 0;
}

.taskModal .side.left {
  padding: 1em 2em 1em 1em;
  top: -80em;
  left: -29em;
  border-radius: 1em 0 0 1em;
}

.taskModal .notes {
  transition: 1s;
  left: 0;
}

.taskModal p {
  display: inline-block;
}

.taskModal .notes textarea {
  width: 100%;
  height: calc(100% - 1em);
  border-radius: 0.5em;
  white-space: pre-wrap;
  display: none;
}

.taskModal .notes p.content {
  display: block;
  max-height: 100%;
  overflow-y: auto;
  cursor: pointer;
  margin-top: 1em;
}

.taskModal .notes ul {
  margin-left: 1.5em;
}

.taskModal .notes input[type=checkbox] {
  width: auto;
}

.taskModal .edit p {
  display: none;
}
.taskModal .edit textarea {
  display: block;
}

.taskModal .content p, 
.taskModal .content ul,
.taskModal .content h1 {
  margin-bottom: 1em;
}
</style>