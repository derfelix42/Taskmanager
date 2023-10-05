<form id="youtube-history" action="tasks.php?youtube">
  <input type="date" name="date" id="date">
  <input type="number" name="id" id="id">
  <input type="hidden" name="youtube">
  <input type="submit" value="submit">
</form>

<div id="youtube-output"></div>

<script defer>
const key = ""

async function getDevices() {
  const resp = await fetch("https://api.stayfreeapps.com/v1/sync/devices?key="+key);
  const json = await resp.json()
  return await json
}

async function getSessions(install_id, date) {
  // let start_time = "2023-01-30T23:59:59.999Z"
  // let end_time = "2023-01-31T23:59:59.999Z"

  let start_time = new Date(date.getTime());
  // start_time.setDate(start_time.getDate() - 1);
  start_time.setUTCHours(23,59,59,999);
  start_time = start_time.toISOString()

  let end_time = new Date(date.getTime());
  end_time.setDate(end_time.getDate() + 1);
  end_time.setUTCHours(23,59,59,999);
  end_time = end_time.toISOString()


  console.log(date, start_time, end_time)

  
  const resp = await fetch("https://api.stayfreeapps.com/v1/sync/devices/sessions?key="+key+"&install_id="+install_id+"&start_time="+start_time+"&end_time="+end_time);
  const json = await resp.json()
  return await json

}

function getYoutubeSessions(sessions) {
  yt_sessions = {sessions: [], daysum: 0}
  last_end = 0

  if(sessions.websites["youtube.com"]) {
    let sum = 0
    for(let yt_session of sessions.websites["youtube.com"].sessions) {
      start = yt_session.timestamp
      let start_date = new Date(start*1000)
      let duration = yt_session.duration
      let end = yt_session.timestamp + duration
      let end_date = new Date(end*1000)

      console.log(toDateTimeString(start_date), "###", toDateTimeString(end_date), "=>", getTimeString(duration))

      if(start - last_end < 60*10) {
        yt_sessions.sessions.at(-1).end_date = end_date
        yt_sessions.sessions.at(-1).duration += duration
      } else {
        yt_sessions.sessions.push({start_date, end_date, duration})
      }
      last_end = end


      sum += duration
    }
    yt_sessions.daysum = sum
  }
  yt_sessions.sessions = yt_sessions.sessions.filter(x => x.duration > 60*10)
  return yt_sessions
}

function getTimeString(seconds) {
  const hours = parseInt(seconds/3600)
  const minutes = parseInt(seconds/60%60)
  const secs = parseInt(seconds%60)

  time_string = ""
  if(hours > 0) {
    time_string += hours+"h "
  }
  if(minutes > 0) {
    time_string += minutes+"m "
  }
  time_string += secs+"s"
  return time_string
}

// function toDateTimeString(date) {
//   return date.toISOString().slice(0, 19).replace('T', ' ')
// }

function toDateTimeString(date) {
  var tzo = -date.getTimezoneOffset(),
      dif = tzo >= 0 ? '+' : '-',
      pad = function(num) {
          return (num < 10 ? '0' : '') + num;
      };

  return date.getFullYear() +
      '-' + pad(date.getMonth() + 1) +
      '-' + pad(date.getDate()) +
      ' ' + pad(date.getHours()) +
      ':' + pad(date.getMinutes()) +
      ':' + pad(date.getSeconds())
}

async function youtube_history() {

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const get_date = urlParams.get("date")
  const id = urlParams.get("id")
  console.log("id, dateParts:", id, get_date)
  
  
  const p = document.getElementById("youtube-output");
  
  if(!id || id === "" || !get_date || get_date === "") {
    console.log("ERROR! Missing parameters ID or DATE!")
    p.appendChild(document.createTextNode("ERROR! Missing parameters ID or DATE!"))
    return
  }

  const dateParts = get_date.split("-");
  const jsDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2].substr(0,2));
  
  const dom_date = document.getElementById("date")
  const dom_id = document.getElementById("id")
  dom_date.value = jsDate.toISOString().substring(0,10);
  dom_id.value = id


  let devices = await getDevices()
  for(let device of devices) {
    console.log(device.name+" -> "+device.install_id)
  }


  let install_id = "***REMOVED***" //devices[0].install_id // MainPC
  let sessions = await getSessions(install_id, jsDate)
  console.log(sessions.websites)

  const yt_sessions = getYoutubeSessions(sessions)
  let local_sum = 0
  for(let yt_session of yt_sessions.sessions) {  
    start = toDateTimeString(yt_session.start_date)
    end = toDateTimeString(yt_session.end_date)
    sql_string = "INSERT INTO `task_history` (`ID`, `taskID`, `start_time`, `stop_time`) VALUES (NULL, '"+id+" ', '"+start+"', '"+end+"');"
    console.log(sql_string)
    tmp = document.createElement("p")
    tmp.appendChild(document.createTextNode(sql_string))
    p.appendChild(tmp)
 

    local_sum += yt_session.duration
  }
  console.log(getTimeString(yt_sessions.daysum), "###", getTimeString(local_sum))
  


}

youtube_history()
</script>