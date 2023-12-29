

class Header {
  constructor() {
    this.header = document.querySelector('header')
    this.title = this.header.querySelector('.title')
    this.startStopBtn = this.header.querySelector('button[name="startStop"]')
    this.time = this.header.querySelector('div.time')
    this.time_input = this.header.querySelector('input.time')
    this.endTaskBtn = this.header.querySelector('button[name="endTask"]')
    this.startTime = this.header.querySelector('.startTime')
    this.endTime = this.header.querySelector('.endTime')

    this.starttime = undefined
    this.timer_interval = undefined

    this.currentTask = {}

    this.title.addEventListener("click", () => {
      if(this.currentTask !== {}) {
        openModal(this.currentTask.ID)
      }
    })

    this.startStopBtn.addEventListener("click", this.startStopTimer)
    this.time.addEventListener("click", () => {
      this.time.classList.add('disabled')
      this.time_input.classList.remove('disabled')
      this.time_input.focus()
    })

    this.endTaskBtn.addEventListener("click", () => {
      endTaskAPI(this.currentTask.ID)
    })

    this.time_input.addEventListener("keypress", async (e) => {
      if(e.key === 'Enter') {
        const value = this.time_input.value
        let new_task = JSON.parse(JSON.stringify(this.currentTask))
        if(value.charAt(0) === "+") {
          let add = parseInt(value.substring(1))
          new_task.time_spent = parseInt(new_task.time_spent) + add*60
        } else if(value.charAt(0) === "-") {
          let sub = parseInt(value.substring(1))
          new_task.time_spent = parseInt(new_task.time_spent) - sub*60
        }

        if(parseInt(new_task.time_spent) < 0)
          new_task.time_spent = 0

        updateTask(new_task, this.currentTask)
        this.currentTask = await getTaskData(this.currentTask.ID)

        this.time_input.classList.add('disabled')
        this.time.classList.remove('disabled')
        this.time_input.value = ""


      }
    })
    this.update_interval = setInterval(this.getCurrentlyActiveTask, 1000)
  }

  getCurrentlyActiveTask = async () => {
    // console.log("Header: Checking for currently active TAsk")
    const currentTaskID = await getCurrentlyActiveTask()
    if(currentTaskID !== -1) {
      const currentTaskData = await getTaskData(currentTaskID)
      this.setCurrentRunningTask(currentTaskData)
      this.updateHeader()
      this.setButtonText("STOP")
    } else {
      this.currentTask = undefined
      this.printTimer()
      this.setButtonText("")
    }
  }

  setCurrentRunningTask = (task) => {
    this.currentTask = task
  }

  updateHeader = async () => {
    this.title.innerText = this.currentTask.Name || "No active Task"
    if(config.debug) {
      console.log("update Header")
    }
    if(this.currentTask.due_date) {
      this.startTime.innerText = this.currentTask.due_time
    } else {
      let seconds =  await getCurrentDayTimeSpent()
      let secs = Math.floor(seconds % 60)
      let min = Math.floor(seconds / 60 % 60)
      let hour = Math.floor(seconds / 60 / 60)

      let timer_string = String(hour.toFixed(0)).padStart(2, "0")+":"
      +String(min.toFixed(0)).padStart(2, "0")+":"
      +String(secs.toFixed(0)).padStart(2, "0")
      this.startTime.innerText = timer_string
    }
    this.endTime.innerText = this.currentTask.duration || ""
    if(this.currentTask.ID === -1)
      this.header.style.backgroundColor = "#"+categoryColors.filter(cat => cat.ID === this.currentTask.category)[0].color
    this.printTimer(this.currentTask.time_spent)
  }

  setButtonText = (text) => {
    this.startStopBtn.innerText = text
  }

  stopTimer = () => {
    clearInterval(this.update_interval)
    // this.storeTimer()
    // this.start_time = undefined
    // this.setButtonText("START")
  }

  startStopTimer = async () => {
    console.log("STop",this.currentTask.ID)
    if(this.currentTask) {
      await stopTimerOnTask(this.currentTask.ID)

    }
    // if(!this.start_time){
    //   this.start_time = new Date()
    //   this.timer_interval = setInterval(this.updateTimer, 1000)
    //   this.setButtonText("STOP")
    // } else {
    //   this.stopTimer()
    // }
  }

  storeTimer = async () => {
    if(this.start_time){
      // await stopTimerOnTask(this.currentTask.ID)
      console.log("Header.js: stopTimer() got called!")
      // let time_diff_secs = parseInt(this.currentTask.time_spent) + Math.floor(((new Date()).getTime() - this.start_time.getTime()) / 1000)
      // let new_task = JSON.parse(JSON.stringify(this.currentTask))
      // new_task.time_spent = time_diff_secs
      // updateTask(new_task, this.currentTask)
      // this.start_time = undefined
    }
  }

  printTimer = (seconds) => {
    let timer_string = ""
    if(seconds) {
      let secs = Math.floor(seconds % 60)
      let min = Math.floor(seconds / 60 % 60)
      let hour = Math.floor(seconds / 60 / 60)

      timer_string = String(hour.toFixed(0)).padStart(2, "0")+":"
      +String(min.toFixed(0)).padStart(2, "0")+":"
      +String(secs.toFixed(0)).padStart(2, "0")
    } else {
      let currTime = new Date()
      timer_string = String(currTime.getHours()).padStart(2, "0")+":"
        +String(currTime.getMinutes()).padStart(2, "0")+":"
        +String(currTime.getSeconds()).padStart(2, "0")
    }
    this.time.innerText = timer_string
  }

  updateTimer = () => {
    // let time_diff_secs
    // if(this.currentTask)
    //   time_diff_secs = parseInt(this.currentTask.time_spent) + Math.floor(((new Date()).getTime() - this.start_time.getTime()) / 1000)
    // this.printTimer(time_diff_secs)
  }

}


async function header_init() {
  let header = new Header()
  const currentTaskID = await getCurrentlyActiveTask()
  if(currentTaskID !== -1) {
    const currentTaskData = await getTaskData(currentTaskID)
    header.setCurrentRunningTask(currentTaskData)
    header.updateHeader()
  }
  // header.startStopTimer()

  window.onbeforeunload = header.stopTimer
}

header_init()
