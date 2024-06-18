
/**
 * Categories
 */
async function getCategoryColors() {
  const res = await fetch("api/getCategoryColors.php");
  return await res.json()
}

async function getCategoryPrefixes(category) {
  const res = await fetch("api/prefixes.php?category=" + category);
  return await res.json()
}


/**
 * Tasks
 */
async function getTasksForDate(date) {
  const res = await fetch("api/getTasks.php?date=" + date);
  let json = await res.json()
  console.log("getTasks for date", date, json)
  return json

}


async function getTaskData(id) {
  // console.log("getTaskData()",id)
  const res = await fetch("api/getTask.php?getTask=" + id);
  let json = await res.json()
  // console.log(json)
  return json
}

async function getTaskNotes(id) {
  const res = await fetch("api/task_notes.php?taskID=" + id);
  let json = await res.json()
  return json
}

async function updateTaskNotes(taskID, text) {
  const url = "api/task_notes.php?update&taskID=" + taskID
  console.log(url, JSON.stringify({note: text}))

  let res = await fetch(url, {
    method: "POST",
    body: JSON.stringify({note: text})
  })

  if (config.debug) console.log(await res.text())
}

async function updateTask(new_task, old_task) {
  const ID = old_task.ID
  const url = "api/updateTask.php?ID=" + ID

  if (config.debug) console.log(url)

  let res = await fetch(url, {
    method: "POST",
    body: JSON.stringify(new_task)
  })

  if (config.debug) console.log(await res.text())

}

async function createTask(task) {
  if (!task.title || !task.due_date) {
    return "no title or no due_date!"
  }

  let body = {
    title: task.title,
    location: task.location,
    description: task.description,
    due: task.due_date,
    priority: task.priority | 5,
    category: task.category | 0,
    duration: task.duration,
    due_time: task.due_time,
  }

  const url = "api/createTask.php"
  const methods = {
    method: "POST",
    body: JSON.stringify(body)
  }

  if (config.debug) console.log(url, methods)

  let res = await fetch(url, methods)
  let text = await res.text()

  if (config.debug) console.log(text)

  try {
    const json = JSON.parse(text);
    return json;
  } catch (e) {
    return {};
  }
}

async function endTaskAPI(ID) {
  await stopTimerOnTask(ID);
  const res = await fetch("api/endTask.php?doneID=" + ID);
  let json = await res.json()
  if (config.debug) {
    console.log(json)
  }
  return json
}

async function startTimerOnTask(ID) {
  const res = await fetch("api/taskHistory.php?start&taskID=" + ID);
  if (config.debug) {
    console.log(await res.text())
  }
  // let json = await res.json()
  // console.log(json)
  // return json
}

async function stopTimerOnTask(ID) {
  const res = await fetch("api/taskHistory.php?stop&taskID=" + ID);
  if (config.debug) {
    console.log(await res.text())
  }  // let json = await res.json()
  // console.log(json)
  // return json
}

async function timeSpentOnTaskID(ID) {
  const res = await fetch("api/taskHistory.php?time&taskID=" + ID);
  if (config.debug) {
    console.log(await res.text())
  }  // let json = await res.json()
  // console.log(json)
  // return json
}

async function getCurrentlyActiveTask() {
  const res = await fetch("api/taskHistory.php?activeTask=1");
  // console.log(await res.text())
  let json = await res.json()
  // console.log(json)
  return json.data.taskID
}

async function getCurrentDayTimeSpent() {
  const res = await fetch("api/getCurrentDayTimeSpent.php");
  let json = await res.json()
  return json.DaySum
}

async function getWakeupTimes(date) {
  date = date.toISOString().split('T')[0]
  const url = "api/getWakeupTimes.php?date=" + date
  if (config.debug) {
    console.log(url)
  }
  const res = await fetch(url)
  let json = await res.json()
  return json
}

async function resetTimerOnTask(ID) {
  const url = "api/taskHistory.php?taskID=" + ID + "&reset"
  await fetch(url)
}

/**
 * HABITS
 */
async function fetchHabits(month, year) {
  let url = "api/habits.php";
  if (month && year) {
    url += "?month=" + month + "&year=" + year
  }
  const res = await fetch(url)
  const json = await res.json()
  return json
}

async function toggleHabit(event, habitID, date) {
  // console.log("toggleHabit",event, habitID, date)
  let url = "api/habits.php?ID=" + habitID + "&date=" + date;
  await fetch(url)
}

// create new habit without name
async function createHabit() {
  const res = await fetch("api/habits.php?create")
  return await res.json()
}

// Update habit name based on habitID
async function updateHabitName(habitID, name) {
  const url = "api/habits.php?updateName=" + habitID
  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify({name: name})
  })
  return await res.json()
}

// delete habit based on habitID
async function deleteHabit(habitID) {
  const url = "api/habits.php?delete=" + habitID
  const res = await fetch(url)
  return await res.json()
}

async function moveHabitToGroup(habitID, groupID) {
  const url = "api/habits.php?move=" + habitID + "&group=" + groupID
  const res = await fetch(url)
  return await res.json()
}

async function createHabitGroup(name) {
  const url = "api/habits.php?createGroup"
  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify({newGroupName: name})
  })
  return await res.json()
}