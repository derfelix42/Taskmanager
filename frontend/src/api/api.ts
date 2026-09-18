
/**
 * Categories
 */
export async function getCategoryColors() {
    const res = await fetch("/api/v2/category");
    return await res.json()
}

/**
 * Tasks
 */
export async function getTasksForDate(date: string) {
    const res = await fetch("/api/v2/task/by_date/" + date);
    let json = await res.json()
    console.log("getTasks for date", date, json)
    return json

}


export async function getTaskData(id: string) {
    // console.log("getTaskData()",id)
    const res = await fetch("/api/getTask.php?getTask=" + id);
    let json = await res.json()
    // console.log(json)
    return json
}

export async function getTaskNotes(id: string) {
    const res = await fetch("/api/task_notes.php?taskID=" + id);
    let json = await res.json()
    return json
}

export async function updateTaskNotes(taskID: string, text: any) {
    const url = "/api/task_notes.php?update&taskID=" + taskID
    console.log(url, JSON.stringify({ note: text }))

    let res = await fetch(url, {
        method: "POST",
        body: JSON.stringify({ note: text })
    })

    if (__DEBUG__) console.log(await res.text())
}

export async function updateTask(new_task: any, old_task: { ID: any; }) {
    const ID = old_task.ID
    const url = "/api/updateTask.php?ID=" + ID

    if (__DEBUG__) console.log(url)

    let res = await fetch(url, {
        method: "POST",
        body: JSON.stringify(new_task)
    })

    if (__DEBUG__) console.log(await res.text())

}

export async function createTask(task: { title: any; due_date: any; location: any; description: any; priority: number; category: number; duration: any; due_time: any; }) {
    console.log("createTask", task.title)
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

    const url = "/api/createTask.php"
    const methods = {
        method: "POST",
        body: JSON.stringify(body)
    }

    if (true) console.log(url, methods)

    let res = await fetch(url, methods)
    let text = await res.text()

    if (true) console.log(text)

    try {
        const json = JSON.parse(text);
        return json;
    } catch (e) {
        return {};
    }
}

export async function endTaskAPI(ID: string) {
    await stopTimerOnTask(ID);
    const res = await fetch("/api/endTask.php?doneID=" + ID);
    let json = await res.json()
    if (__DEBUG__) {
        console.log(json)
    }
    return json
}

export async function startTimerOnTask(ID: string) {
    const res = await fetch("/api/taskHistory.php?start&taskID=" + ID);
    if (__DEBUG__) {
        console.log(await res.text())
    }
    // let json = await res.json()
    // console.log(json)
    // return json
}

export async function stopTimerOnTask(ID: string) {
    const res = await fetch("/api/taskHistory.php?stop&taskID=" + ID);
    if (__DEBUG__) {
        console.log(await res.text())
    }  // let json = await res.json()
    // console.log(json)
    // return json
}

export async function timeSpentOnTaskID(ID: string) {
    const res = await fetch("/api/taskHistory.php?time&taskID=" + ID);
    if (__DEBUG__) {
        console.log(await res.text())
    }  // let json = await res.json()
    // console.log(json)
    // return json
}

export async function getCurrentlyActiveTask() {
    const res = await fetch("/api/taskHistory.php?activeTask=1");
    // console.log(await res.text())
    let json = await res.json()
    // console.log(json)
    return json.data.taskID
}

export async function getCurrentDayTimeSpent() {
    const res = await fetch("/api/getCurrentDayTimeSpent.php");
    let json = await res.json()
    return json.DaySum
}

export async function getWakeupTimes(date: string) {
    date = date.toISOString().split('T')[0]
    const url = "/api/getSleepHistory.php?date=" + date
    if (__DEBUG__) {
        console.log(url)
    }
    const res = await fetch(url)
    let json = await res.json()
    return json
}

export async function resetTimerOnTask(ID: string) {
    const url = "/api/taskHistory.php?taskID=" + ID + "&reset"
    await fetch(url)
}

/**
 * HABITS
 */
export async function fetchHabits(month: string, year: string) {
    let url = "/api/habits.php";
    if (month && year) {
        url += "?month=" + month + "&year=" + year
    }
    const res = await fetch(url)
    const json = await res.json()
    return json
}

export async function toggleHabit(event: any, habitID: string, date: string) {
    // console.log("toggleHabit",event, habitID, date)
    let url = "/api/habits.php?ID=" + habitID + "&date=" + date;
    await fetch(url)
}

// create new habit without name
export async function createHabit() {
    const res = await fetch("/api/habits.php?create")
    return await res.json()
}

// Update habit name based on habitID
export async function updateHabitName(habitID: string, name: any) {
    const url = "/api/habits.php?updateName=" + habitID
    const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify({ name: name })
    })
    return await res.json()
}

// delete habit based on habitID
export async function deleteHabit(habitID: string) {
    const url = "/api/habits.php?delete=" + habitID
    const res = await fetch(url)
    return await res.json()
}

// move habit into another Group
export async function moveHabitToGroup(habitID: string, groupID: string) {
    const url = "/api/habits.php?move=" + habitID + "&group=" + groupID
    const res = await fetch(url)
    return await res.json()
}

// Create a new Habit Group
export async function createHabitGroup(name: any) {
    const url = "/api/habits.php?createGroup"
    const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify({ newGroupName: name })
    })
    return await res.json()
}

// Rename an existing Habit Group
export async function renameHabitGroup(groupID: string, name: any) {
    const url = "/api/habits.php?renameGroup=" + groupID
    const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify({ name: name })
    })
    return await res.json()
}

// Delete a habit Group
export async function deleteHabitGroup(groupID: string) {
    const url = "/api/habits.php?deleteGroup=" + groupID
    const res = await fetch(url)
    return await res.json()
}

/**
 * Weather / Sun Endpoint
 */

// get sunrise / sunset
export async function getSunTimes(date: string) {
    const url = "/api/v2/weather/sun_times?date=" + date
    const res = await fetch(url)
    return await res.json()
}