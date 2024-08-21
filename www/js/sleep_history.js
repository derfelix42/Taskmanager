let wakeUpNow_btn = document.getElementById("wakeUpNow_btn")
wakeUpNow_btn.addEventListener("click", async () => {
    await wakeUpNow()
    await check_current_sleep_status()
})

let goToSleep_btn = document.getElementById("goToSleep_btn")
goToSleep_btn.addEventListener("click", async () => {
    await goToSleepNow()
    await check_current_sleep_status()
})


async function check_current_sleep_status() {
    let text_output = document.getElementById("sleep_awake_since_text")
    let sleep_sessions = await getWakeupTimes(new Date());
    console.log(sleep_sessions)
    let current_session = sleep_sessions.data.filter(x => parseInt(x.is_active) === 1)
    if (current_session.length > 0) {
        text_output.innerText = "Sleeping since "+current_session[0].sleep_time+" ("+current_session[0].sleep_hours.substring(0, 5)+")"
        wakeUpNow_btn.classList.remove("disabled")
        goToSleep_btn.classList.add("disabled")
    } else if (sleep_sessions.data.length > 0) {
        const latest_session = sleep_sessions.data[sleep_sessions.data.length - 1]
        let seconds = ((new Date()) - (new Date(latest_session.stop_time)))/1000
        let secs = Math.floor(seconds % 60)
        let min = Math.floor(seconds / 60 % 60)
        let hour = Math.floor(seconds / 60 / 60)
        let timer_string = String(hour.toFixed(0)).padStart(2, "0") + ":"
          + String(min.toFixed(0)).padStart(2, "0") + ":"
          + String(secs.toFixed(0)).padStart(2, "0")
        // console.log(latest_session)
        text_output.innerText = "Awake since "+latest_session.wakeup_time+" ("+timer_string+")"
        console.log("Awake for",seconds,"seconds -", 60*60*24, seconds > 60 * 60 * 24)
        if (seconds > 60 * 60 * 24) {
            goToSleep_btn.innerHTML = "Go the fuck to sleep! <i class=\"fa-solid fa-bed small\"></i>"
        } else {
            goToSleep_btn.innerHTML = "Go to sleep <i class=\"fa-solid fa-bed small\"></i>"
        }
        wakeUpNow_btn.classList.add("disabled")
        goToSleep_btn.classList.remove("disabled")
    } else {
        text_output.innerText = "No sleep tracking has been done so far..."
        wakeUpNow_btn.classList.add("disabled")
        goToSleep_btn.classList.remove("disabled")
    }
}

check_current_sleep_status()
