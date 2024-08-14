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
        console.log(latest_session)
        text_output.innerText = "Awake since "+latest_session.wakeup_time+" ("+((new Date()) - (new Date(latest_session.stop_time)))/1000+"s)"
        wakeUpNow_btn.classList.add("disabled")
        goToSleep_btn.classList.remove("disabled")
    } else {
        text_output.innerText = "No sleep tracking has been done so far..."
        wakeUpNow_btn.classList.add("disabled")
        goToSleep_btn.classList.remove("disabled")
    }
}

check_current_sleep_status()
