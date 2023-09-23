async function getTaskData(id) {
  // console.log("getTaskData()",id)
  const res = await fetch("api/getTask.php?getTask="+id);
  let json = await res.json()
  // console.log(json)
  return json
}

async function getCategoryColors() {
  const res = await fetch("api/getCategoryColors.php");
  return await res.json()
}

async function getCategoryPrefixes(category) {
  const res = await fetch("api/prefixes.php?category="+category);
  return await res.json()
}

async function updateTask(new_task, old_task) {
  const ID = old_task.ID
  let data = []
  if(old_task.title !== new_task.title) {
    data.push("title="+encodeURIComponent(new_task.title))
  }
  if(old_task.description !== new_task.description) {
    data.push("description="+encodeURIComponent(new_task.description))
  }
  if(old_task.time_spent !== new_task.time_spent) {
    //data.push("time_spent="+new_task.time_spent)
    console.log("OH NO!")
    alert("Depricated!")
  }
  if(old_task.due !== new_task.due) {
    data.push("due="+new_task.due)
  }
  if(old_task.due_time !== new_task.due_time) {
    data.push("due_time="+new_task.due_time)
  }
  if(old_task.duration !== new_task.duration) {
    data.push("duration="+new_task.duration)
  }
  if(old_task.category !== new_task.category) {
    data.push("category="+new_task.category)
  }
  if(old_task.priority !== new_task.priority) {
    data.push("priority="+new_task.priority)
  }
  if(old_task.location !== new_task.location) {
    data.push("location="+new_task.location)
  }
  if(old_task.deleted !== new_task.deleted) {
    data.push("deleted="+new_task.deleted)
  }
  if(old_task.difficulty !== new_task.difficulty) {
    data.push("difficulty="+new_task.difficulty)
  }

  if(data.length > 0 || old_task.description !== new_task.description) {
    if(config.debug) {
      console.log("Updating to", new_task)
    }
    const data_string = "&"+data.join("&")

    const url = encodeURI("api/updateTask.php?ID="+ID+data_string)
    if(config.debug) {
      console.log(url)
    }
    let res = await fetch(url)
    if(config.debug) {
      console.log(await res.text())
    }
  }
}

async function createTask(task) {
  let data = []
  if(task.title) {
    data.push("title="+task.title)
  } else {
    return "no title!"
    console.log("no title!")
  }
  if(task.description) {
    data.push("description="+task.description)
  }
  if(task.due_date) {
    data.push("due="+task.due_date)
  } else {
    return "no due_date!"
    console.log("no due_date!")
  }
  if(task.due_time) {
    data.push("duetime="+task.due_time)
  }
  if(task.duration) {
    data.push("duration="+task.duration)
  }
  if(task.priority) {
    data.push("priority="+task.priority)
  } else {
    data.push("priority=5")
  }
  if(task.category) {
    data.push("category="+task.category)
  } else {
    data.push("category=0")
  }
  if(task.location) {
    data.push("location="+task.location)
  }

  const data_string = data.join("&")

  const url = encodeURI("api/createTask.php?"+data_string)
  if(config.debug) {
    console.log(url)
  }
  let res = await fetch(url)
  let text = await res.text()
  if(config.debug) {
    console.log(text)
  }
  try {
    const json = JSON.parse(text);
    return json;
  } catch (e) {
    return {};
  }
}

async function endTaskAPI(ID) {
  await stopTimerOnTask(ID);
  const res = await fetch("api/endTask.php?doneID="+ID);
  let json = await res.json()
  if(config.debug) {
    console.log(json)
  }
  return json
}

async function startTimerOnTask(ID) {
  const res = await fetch("api/taskHistory.php?start&taskID="+ID);
  if(config.debug) {
    console.log(await res.text())
  }
  // let json = await res.json()
  // console.log(json)
  // return json
}

async function stopTimerOnTask(ID) {
  const res = await fetch("api/taskHistory.php?stop&taskID="+ID);
  if(config.debug) {
    console.log(await res.text())
  }  // let json = await res.json()
  // console.log(json)
  // return json
}

async function timeSpentOnTaskID(ID) {
  const res = await fetch("api/taskHistory.php?time&taskID="+ID);
  if(config.debug) {
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
  const url = "api/getWakeupTimes.php?date="+date
  if(config.debug) {
    console.log(url)
  }
  const res = await fetch(url)
  let json = await res.json()
  return json
}

async function resetTimerOnTask(ID) {
  const url = "api/taskHistory.php?taskID="+ID+"&reset"
  await fetch(url)
}