<?php
echo date_default_timezone_get();
?>

<script>

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

function notifyMe() {
  // Let's check if the browser supports notifications
  if (!("Notification" in window)) {
    alert("This browser does not support system notifications");
    // This is not how you would really do things if they aren't supported. :)
  }

  // Let's check whether notification permissions have already been granted
  else if (Notification.permission === "granted") {
    // If it's okay let's create a notification
    var notification = new Notification("Hi there!");
    alert("Notifying you right now!");
  }

  // Otherwise, we need to ask the user for permission
  else if (Notification.permission !== 'denied') {
    Notification.requestPermission(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        var notification = new Notification("Hi there!");
        alert("Notifying you right now!");
      }
    });
  }

  // Finally, if the user has denied notifications and you
  // want to be respectful there is no need to bother them any more.
}
console.log("Test!");
checkNotifyStatus();

//notifyMe();


let now = new Date();
let millis = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20,14,0,0) - now;
setTimeout(function(){new Notification('Taskmanager', { body: "Geh hoch fernsehen!"}, "../Instagram/images/_MG_9137.jpg", millis);});

</script>
