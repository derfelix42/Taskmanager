<?php
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

$globals["database_name"] = "j_tasks";
require_once("includes/db_connection.php");
include_once("includes/weatherApi.php");


$db = $globals['db'];

$day = "";
$day_sel = "";
$category = $_GET['category'];
if(isset($_GET['today'])) {
  $day = "today";
  $day_sel = "AND due = CURRENT_DATE";
}
if(isset($_GET['tomorrow'])) {
  $day_sel = "AND due = CURRENT_DATE+1";
  $day = "tomorrow";
}

if(isset($_GET['doneID'])) {
  $doneID = $_GET['doneID'];
  $category = "";
  if(!empty($_GET['category'])) {
    $category = "&category=".$_GET['category'];
  }
  $sql = "UPDATE `tasks` SET `done` = NOW() WHERE `tasks`.`ID` = '$doneID'";
  mysqli_query($db, $sql);
  header("Location: tasks.php?$day$category");
  //header("Location: tasks.php?activeInput&category=$category");
  exit();
}

if(isset($_GET['setNewDate'])) {
  $newDay = $_GET['setNewDate'];
  $d = "CURRENT_DATE()";
  if($newDay == "tomorrow") {
    $d = "CURRENT_DATE()+1";
  }
  $ID = $_GET['ID'];
  $sql = "UPDATE `tasks` SET `due` = $d WHERE `tasks`.`ID` = '$ID'";
  mysqli_query($db, $sql);
  header("Location: tasks.php?today");
}

if(isset($_GET['name'])) {
  $name = htmlentities($_GET['name']);
  $desc = htmlentities($_GET['desc']);
  $duedate = "'".$_GET['duedate']."'";
  $duetime = (!empty($_GET['duetime']) ? "'".$_GET['duetime']."'": "NULL");
  $duration = (!empty($_GET['duration']) ? "'".$_GET['duration']."'": "NULL");
  $priority = $_GET['priority'];
  $category = $_GET['category'];
  $sql = "INSERT INTO `tasks` (`ID`, `Name`, `description`, `due`, `due_time`, `done`, `duration`, `priority`, `category`) VALUES (NULL, '$name', '$desc', $duedate, $duetime, NULL, $duration, '$priority', '$category');";
//echo $sql; exit();
  mysqli_query($db, $sql);

  header("Location: tasks.php?activeInput&category=$category&$day");
  exit();
}

if(isset($_GET['revive'])) {
  $ID = $_GET['revive'];
  $sql = "UPDATE `tasks` SET `done` = NULL WHERE `tasks`.`ID` = '$ID'";
  mysqli_query($db, $sql);
  header("Location: tasks.php?$day&category=$category");
  exit();
}

$cat_sel = "";
if(empty($day)) {
  if(isset($_GET['category'])) {
    $category = $_GET['category'];
    $cat_sel = "AND category = $category";
  }
}
$sql = "SELECT tasks.ID, Name, time_spent, description, due, due_time, DAYOFWEEK(due) AS DOW, duration, TIMESTAMPDIFF(DAY, NOW(), due) AS daysLeft, if(CURRENT_DATE>due, 11, priority) as priority, color FROM `tasks` JOIN category ON tasks.category = category.ID WHERE done IS NULL $cat_sel $day_sel ORDER BY due ASC, due_time ASC, priority DESC, category";
$result = mysqli_query($db, $sql);

?>

<html>
<head>
  <title>J_Tasks</title>
  <link rel="stylesheet" href="css/J_Tasks.css">
  <link rel="stylesheet" href="css/taskModal.css">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!--meta http-equiv="refresh" content="600; url=tasks.php<?php //echo "?$day&category=$category"; ?>"-->
  <script>
  let categoryColors = {}
  fetch ("api/getCategoryColors.php")
    .then (response => response.json())
    .then (json => categoryColors = json);

  function updateDurationSumOfDay(day, sum) {
    //console.log("Update Date's Duration Sum of",day,"to",sum)
    let prev_sum = document.getElementById(day)
    //console.log(prev_sum)
    prev_sum.innerText = sum
  }

  function updateSpentTimeOfDay(day, sum) {
    console.log("Udpating",day,"to",sum)
    let prev_sum = document.getElementById(day)
    if(prev_sum)
      prev_sum.innerText = sum
  }

  Number.prototype.pad = function(size) {
    let s = String(this);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
  }
  </script>
  <script src="js/taskModal.js" defer></script>
  <script src="js/Notification.js" defer></script>
</head>
<div id="sound" style="display: none"></div>

<div id="sidebar">
  <ul>
    <a href='?'><li>All Tasks</li></a>
<hr>
<?php
$sql = "SELECT * FROM `category` WHERE display = 1";
$cats = mysqli_query($db, $sql);

if(mysqli_num_rows($cats)>0) {
  while($row = mysqli_fetch_assoc($cats)) {
    $cat_id = $row['ID'];
    $cat_bez = $row['Bezeichnung'];
    $color = $row['color'];
    if(empty($color)) {
      $color = "777";
    }
    echo "<a href='?category=$cat_id'><li><div class='categoryIndicator' style='--color: #$color'></div>$cat_bez</li></a>";
  }
}


?>
  </ul>
  <hr>
  <ul>
    <a href="?today"><li>Heutige Aufgaben</li></a>
    <a href="?tomorrow"><li>Morgen</li></a>
  </ul>
</div>

<main>


<center><h2>Open Tasks:</h2></center>
<table>
  <tr>
    <th>Name</th>
    <th>Description</th>
    <th>DaysLeft</th>
    <th>DueDate</th>
    <th>DueTime</th>
    <th>Duration</th>
    <th></th>
  </tr>

<?php
/**

ADDING CURRENT THE EVENTS

*/
$weather = getForecast();

$day = 0;
$duration_sum = 0;
$spent_time_daysum = 0;
if(mysqli_num_rows($result)>0) {
  while($row = mysqli_fetch_assoc($result)) {
    $ID = $row['ID'];
    $name = utf8_encode($row['Name']);
    $desc = utf8_encode(str_replace("\n", "<br>", $row['description']));
    $DaysLeft = $row['daysLeft'];
    $DueDate = $row['due'];
    $DueTime = $row['due_time'];
    $Duration = $row['duration'];
    $priority = $row['priority'];
    $color = $row['color'];
    if(empty($color)) {
      $color = "777";
    }
    $setNewDate = "";
    $exclamation = "";
    if($priority == 10) {
      $exclamation = "<b>❗</b>";
    }

    $duration_sum += $Duration;

    if($DaysLeft >=0) {
      if($day != $DueDate) {

        $daysOfWeek = array("Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag");
        $dow = $daysOfWeek[$row['DOW']-1];
        $date_text = date("d.m.Y", strtotime($DueDate));

        //update duration sum of previous day
        echo "<script>updateDurationSumOfDay('daysum_".$day."', $duration_sum)</script>";

        $time_spent_day_sum_sql = "SELECT SUM(time_spent) as sum FROM `tasks` WHERE (done IS NULL AND due = '$DueDate') OR DATE(done) = '$DueDate'";

        $time_spent_day_sum_res = mysqli_query($db, $time_spent_day_sum_sql);
        $time_spent_day_sum_string = "";
        if(mysqli_num_rows($time_spent_day_sum_res)>0) {
          $time_spent_day_sum_secs = mysqli_fetch_assoc($time_spent_day_sum_res)['sum'];

          $time_spent_day_sum_minutes = str_pad(floor($time_spent_day_sum_secs / 60 % 60), 2, '0', STR_PAD_LEFT);
          $time_spent_day_sum_hours = floor($time_spent_day_sum_secs / 60 / 60);

          $time_spent_day_sum_string = "(".$time_spent_day_sum_hours.":".$time_spent_day_sum_minutes.")";
        }


        $sunrise = date_sunrise(strtotime($DueDate), SUNFUNCS_RET_STRING, 50.620721, 6.960079, 90, 1);
        $sunset = date_sunset(strtotime($DueDate), SUNFUNCS_RET_STRING, 50.620721, 6.960079, 90, 1);
	      $sunset_dark = date_sunset(strtotime($DueDate), SUNFUNCS_RET_STRING, 50.620721, 6.960079, 102, 1);

        $weatherInfo = "";
        foreach($weather as $wd) {
          if(!(intval(date_diff(new DateTime("now"), new DateTime($DueDate))->format("%a")) > 3)) { //Eigentlich >5, aber scheinbar muss es >3 sein :laugh:
            $weatherInfo = $weather[$DueDate][1]."°C bis ".$weather[$DueDate][2]."°C";
          }
        }

        echo "
            <tr date>
              <td>$dow - $date_text $time_spent_day_sum_string</td>
              <td></td>
              <td>$weatherInfo</td>
              <td>🌅 $sunrise</td>
              <td>🌇 $sunset / $sunset_dark</td>
              <td id='daysum_$DueDate'></td>
              <td></td>
            </tr>
        ";
        $day = $DueDate;
        $duration_sum = 0;
        $spent_time_daysum = 0;
      }
      if($DaysLeft == 0)
        $setNewDate = " :: <a href='tasks.php?setNewDate=tomorrow&ID=$ID&$category&$day'>Auf morgen verschieben</a>";
    } else {
      if(!isset($category)) {
        $category = "";
      }
      $setNewDate = " :: Auf <a href='tasks.php?setNewDate=today&ID=$ID&$category&$day'>heute</a> / <a href='tasks.php?setNewDate=tomorrow&ID=$ID&$category&$day'>morgen</a> verschieben";
    }

    $curSelDay = "";
    if(isset($_GET['today'])) {
      $curSelDay = "today";
    }
    if(isset($_GET['tomorrow'])) {
      $curSelDay = "tomorrow";
    }

    if(!empty($DueTime) && $DaysLeft == 0) {
      $DueTime = $DueTime."<script>addNotification(\"$DueDate\", \"$DueTime\", \"$name. ($ID)\");</script>";
    }

    $time_spent_string = "";
    $time_spent = $row['time_spent'];
    if($time_spent > 0) {
      $spent_time_daysum += $time_spent;
      $minutes = str_pad(floor($time_spent / 60 % 60), 2, '0', STR_PAD_LEFT);
      $hours = floor($time_spent / 60 / 60);

      $time_spent_string = "($hours:$minutes)";
    }

    echo "
        <tr priority='$priority'>
          <td onclick='openModal($ID)' class='clickable'><div class='categoryIndicator' style='--color: #$color'></div>$name $exclamation $time_spent_string</td>
          <td onclick='openModal($ID)' class='clickable'><p class='description'>$desc</p></td>
          <td><p id='timeLeft_$ID'>$DaysLeft</p> $setNewDate</td>
          <td>$DueDate</td>
          <td>$DueTime</td>
          <td>$Duration</td>
          <td><a href='tasks.php?doneID=$ID&category=$category&$curSelDay'>&#10004;</a></td>
        </tr>
    ";
  }
  echo "<script>updateDurationSumOfDay('daysum_".$day."', $duration_sum)</script>";
}


?>
<tr>
  <form method="get">
    <td><input type="text" name="name" placeholder="Name" required <?php if(isset($_GET['activeInput'])){ echo "autofocus";}?>/></td>
    <td><textarea name="desc" placeholder="Description"></textarea></td>
    <td><input tpye="number" min="0" max="10" name="priority" placeholder="priority (0-10)" required value="5"/></td>
    <td><input type="date" name="duedate" required value="<?php echo (new Datetime('tomorrow'))->format('Y-m-d') ?>"/></td>
    <td><input type="time" name="duetime"/></td>
    <td><input type="time" name="duration"/></td>
    <td><input type="submit" value="&#10148;"</td>
    <input type="hidden" name="category" value="<?php if(isset($category)) {echo $category;} else echo "0";?>">
  </form>
</tr>

</table>


<!-- Finished Tasks -->

<br>
<center><h2>Finished Tasks:</h2></center>
<table>
  <tr>
    <th>Name</th>
    <th>Description</th>
    <th>Duration</th>
    <th>DueDateTime</th>
    <th>DoneDateTime</th>
    <th>DaysAgo</th>
    <th>TimeDiff[Days]</th>
    <th></th>
  </tr>

<?php
$day_sel = "AND TIMESTAMPDIFF(DAY, done, NOW()) < 7";
if(isset($_GET['today'])) {
  $day_sel = "AND DATE(done) = CURRENT_DATE";
}
if(isset($_GET['tomorrow'])) {
  $day_sel = "AND DATE(done) = CURRENT_DATE+1";
}

$sql = "SELECT tasks.ID, Name, time_spent, description, done, duration, priority, IF(due_time IS NOT NULL, TIMESTAMP(due, due_time), TIMESTAMP(due)) AS due, TIMESTAMPDIFF(DAY,(IF(due_time IS NOT NULL, TIMESTAMP(due, due_time), TIMESTAMP(due))), done) as timeDiff, TIMESTAMPDIFF(DAY, done, NOW()) AS DaysAgo, color FROM `tasks` JOIN category ON category.ID = tasks.category WHERE done IS NOT NULL $cat_sel $day_sel ORDER BY done desc, priority desc";
//echo $sql;
$result = mysqli_query($db, $sql);

if(mysqli_num_rows($result)>0) {
  while($row = mysqli_fetch_assoc($result)) {
    $ID = $row['ID'];
    $name = utf8_encode($row['Name']);
    $desc = utf8_encode(str_replace("\n", "<br>", $row['description']));
    $duration = "";
    if(isset($row['duration'])) {
      $duration = $row['duration'];
    }
    $due = $row['due'];
    $done = $row['done'];
    $ago = $row['DaysAgo'];
    $timediff = $row['timeDiff'];
    $priority = $row['priority'];
    if(empty($row['color'])) {
      $color = "777";
    } else {
      $color = $row['color'];
    }

    $time_spent = $row['time_spent'];
    if($time_spent > 0) {
      $minutes = str_pad(floor($time_spent / 60 % 60), 2, '0', STR_PAD_LEFT);
      $hours = floor($time_spent / 60 / 60);

      $time_spent_string = "($hours:$minutes)";
    } else {
      $time_spent_string = "";
    }

    echo "
        <tr priority='$priority'>
          <td><div class='categoryIndicator' style='--color: #$color'></div>$name $time_spent_string</td>
          <td>$desc</td>
          <td>$duration</td>
          <td>$due</td>
          <td>$done</td>
          <td>$ago</td>
          <td>$timediff</td>
          <td><a href='tasks.php?revive=$ID&category=$category&$curSelDay'>&#10004;</a></td>
        </tr>
    ";

  }
}


?>

</table>
</main>

<div id="taskModal" class="taskModal">
  <div class="header">
    Aufgabe <p>ID</p> bearbeiten
    <p class="float-right" onclick="closeTaskModal()">[X]</p>
  </div>
  <div class="main">
    <div class="settings">
      <h1>Titel</h1>
      <input type="text" name="title" value="title" class="disabled">
      <p class="description"></p>
      <textarea name="description" rows="8" cols="80" class="disabled"></textarea>
    </div>
    <hr>
    <div class="deadline">
      <label>Deadline: <input type="date" name="due-date"><input type="time" name="due-time"></label>
    </div>
    <hr>
    <div class="timer">
      <div class="time">00:00:00</div>
      <input class="time disabled" type="text" name="timer" value="" placeholder="Add/Substract Time in Seconds">
      <button type="button" name="startStop">START</button>
      <button type="button" name="endTask">Aufgabe beendet</button>
    </div>
  </div>
</div>
