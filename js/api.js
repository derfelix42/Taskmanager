async function getTaskData(id) {
  // console.log("getTaskData()",id)
  const res = await fetch("api/getTask.php?getTask="+id);
  let json = await res.json()
  // console.log(json)
  return json
}

async function updateTask(new_task, old_task) {
  const ID = old_task.ID
  let data = []
  if(old_task.title !== new_task.title) {
    data.push("title="+new_task.title)
  }
  if(old_task.description !== new_task.description) {
    data.push("description="+new_task.description)
  }
  if(old_task.time_spent !== new_task.time_spent) {
    //data.push("time_spent="+new_task.time_spent)
    console.log("OH NO!")
    alert("OH NO!")
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

  if(data.length > 0) {
    console.log("Updating to", new_task)
    const data_string = "&"+data.join("&")

    const url = encodeURI("api/updateTask.php?ID="+ID+data_string)
    console.log(url)
    let res = await fetch(url)
    console.log(await res.text())
  }
}

async function endTaskAPI(ID) {
  const res = await fetch("api/endTask.php?doneID="+ID);
  let json = await res.json()
  console.log(json)
  return json
}

async function startTimerOnTask(ID) {
  const res = await fetch("api/taskHistory.php?start&taskID="+ID);
  console.log(await res.text())
  // let json = await res.json()
  // console.log(json)
  // return json
}

async function stopTimerOnTask(ID) {
  const res = await fetch("api/taskHistory.php?stop&taskID="+ID);
  console.log(await res.text())
  // let json = await res.json()
  // console.log(json)
  // return json
}

async function timeSpentOnTaskID(ID) {
  const res = await fetch("api/taskHistory.php?time&taskID="+ID);
  console.log(await res.text())
  // let json = await res.json()
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
