function checkNotifyStatus() {
  console.log("Checking NotificationStatus!");
  if (!("Notification" in window)) {
    console.log("Notifications not supported!");
  }
  if (Notification.permission !== 'denied' && Notification.permission !== 'granted') {
    Notification.requestPermission(function (permission) {
      if (permission === "granted") {
        var notification = new Notification("Notifications are enabled now!");
      }
    });
  }
}

/**
  * Plays a sound using the HTML5 audio tag. Provide mp3 and ogg files for best browser support.
  * @param {string} filename The name of the file. Omit the ending!
  */
function playSound(filename){
  let folder = "assets/sounds/";
  var mp3Source = '<source src="' + folder + filename + '.mp3" type="audio/mpeg">';
  var oggSource = '<source src="' + folder + filename + '.ogg" type="audio/ogg">';
  var embedSource = '<embed hidden="true" autostart="true" loop="false" src="' + folder + filename +'.mp3">';
  document.getElementById("sound").innerHTML='<audio autoplay="autoplay">' + mp3Source + oggSource + embedSource + '</audio>';
  console.log("Playing "+filename+" sound!");
}

function addNotification(date, time, name) {
  let icon = "../Instagram/images/IMG_6337.jpg";
  let now = new Date();
  date = date.split("-");
  let Y = parseInt(date[0]);
  let M = parseInt(date[1]);
  let D = parseInt(date[2]);
  time = time.split(":");
  let h = parseInt(time[0]);
  let m = parseInt(time[1]);
  let s = parseInt(time[2]);
  let newDate = new Date(Y, M-1, D, h,m,s,0);
  let millis = newDate - now;
  setTimeout(function(){
    new Notification('Taskmanager', { body: name, icon: icon});
    playSound("ding");
  }, millis);
  console.log("Added Notification called \""+name+"\" in "+millis+"ms ("+date+" "+time+" - "+newDate+")");
}

checkNotifyStatus();
