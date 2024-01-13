<?php
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

$globals["database_name"] = "j_tasks";
require_once("includes/db_connection.php");
include_once("includes/weatherApi.php");
include_once('export.php');

$db = $globals['db'];
include_once("./cronjobs.php");

$day = "";
$day_sel = "";
$category = "";
$prefix = "";
if (isset($_GET['category'])) {
  $category = $_GET['category'];
}
if (isset($_GET['today'])) {
  $day = "today";
  $day_sel = "AND due = CURRENT_DATE";
}
if (isset($_GET['tomorrow'])) {
  $day_sel = "AND due = DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY)";
  $day = "tomorrow";
}
if (isset($_GET['yesterday'])) {
  $day_sel = "AND due = DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY)";
  $day = "yesterday";
}
if (isset($_GET['date'])) {
  $selectedDate = $_GET['date'];
  $day_sel = "AND due = '" . $selectedDate . "'";
  $day = "date=" . $selectedDate;
}
if (isset($_GET['prefix'])) {
  $prefix = $_GET['prefix'];
}

if (isset($_GET['doneID'])) {
  $doneID = $_GET['doneID'];
  $category = "";
  if (!empty($_GET['category'])) {
    $category = "&category=" . $_GET['category'];
  }
  $sql = "UPDATE `tasks` SET `done` = NOW() WHERE `tasks`.`ID` = '$doneID'";
  mysqli_query($db, $sql);
  header("Location: tasks.php?$day$category&prefix=$prefix");
  //header("Location: tasks.php?activeInput&category=$category");
  exit();
}

$curSelDay = "";
if (isset($_GET['today'])) {
  $curSelDay = "today";
}
if (isset($_GET['tomorrow'])) {
  $curSelDay = "tomorrow";
}

if (isset($_GET['setNewDate'])) {
  $newDay = $_GET['setNewDate'];
  $d = "CURRENT_DATE()";
  if ($newDay == "tomorrow") {
    $d = "CURRENT_DATE()+1";
  }
  $ID = $_GET['ID'];
  $sql = "UPDATE `tasks` SET `due` = $d WHERE `tasks`.`ID` = '$ID'";
  mysqli_query($db, $sql);
  header("Location: tasks.php?today");
}

if (isset($_GET['name'])) {
  $name = htmlentities($_GET['name']);
  $desc = htmlentities($_GET['desc']);
  $duedate = "'" . $_GET['duedate'] . "'";
  $duetime = (!empty($_GET['duetime']) ? "'" . $_GET['duetime'] . "'" : "NULL");
  $duration = (!empty($_GET['duration']) ? "'" . $_GET['duration'] . "'" : "NULL");
  $priority = $_GET['priority'];
  $category = $_GET['category'];
  $sql = "INSERT INTO `tasks` (`ID`, `Name`, `description`, `due`, `due_time`, `done`, `duration`, `priority`, `category`) VALUES (NULL, '$name', '$desc', $duedate, $duetime, NULL, $duration, '$priority', '$category');";
  //echo $sql; exit();
  mysqli_query($db, $sql);

  header("Location: tasks.php?activeInput&category=$category&$day&prefix=$prefix");
  exit();
}

if (isset($_GET['revive'])) {
  $ID = $_GET['revive'];
  $sql = "UPDATE `tasks` SET `done` = NULL WHERE `tasks`.`ID` = '$ID'";
  mysqli_query($db, $sql);
  header("Location: tasks.php?$day&category=$category&prefix=$prefix");
  exit();
}

$cat_sel = "";
if (empty($day)) {
  if (isset($_GET['category'])) {
    $category = $_GET['category'];
    $cat_sel = "AND category = $category";
  }
}
$sql = "SELECT tasks.ID, Name, description, due, due_time, DAYOFWEEK(due) AS DOW, duration, (HOUR(duration) + (MINUTE(duration)/60)) as duration2, TIMESTAMPDIFF(DAY, NOW(), due) AS daysLeft, if(CURRENT_DATE>due, 11, priority) as priority, difficulty, color, IFNULL(time_spent_new, 0) as time_spent, category, location
          FROM `tasks`
          JOIN category ON tasks.category = category.ID
          LEFT JOIN (SELECT taskID, SUM(TIMESTAMPDIFF(SECOND, start_time, IFNULL(stop_time, CURRENT_TIMESTAMP))) as time_spent_new FROM `task_history` GROUP BY taskID) as b ON tasks.ID = b.taskID
          WHERE done IS NULL $cat_sel $day_sel AND deleted = 0 AND Name LIKE '$prefix%'
          ORDER BY due ASC, due_time ASC, priority DESC, category";

#$sql = "SELECT tasks.ID, Name, time_spent, description, due, due_time, DAYOFWEEK(due) AS DOW, duration, TIMESTAMPDIFF(DAY, NOW(), due) AS daysLeft, if(CURRENT_DATE>due, 11, priority) as priority, color FROM `tasks` JOIN category ON tasks.category = category.ID WHERE done IS NULL $cat_sel $day_sel ORDER BY due ASC, due_time ASC, priority DESC, category";
$result = mysqli_query($db, $sql);

?>
<!DOCTYPE html>
<html lang="de">

<head>
  <title>J_Tasks</title>
  <link rel="stylesheet" href="css/J_Tasks.css">
  <link rel="stylesheet" href="css/taskModal.css">
  <link rel="stylesheet" href="css/header.css">
  <link rel="stylesheet" href="css/settings.css">
  <link rel="stylesheet" href="css/habits.css">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!--meta http-equiv="refresh" content="600; url=tasks.php<?php //echo "?$day&category=$category"; ?>"-->
  <script>
    let categoryColors = {}
    fetch("api/getCategoryColors.php")
      .then(response => response.json())
      .then(json => categoryColors = json);

    function updateDurationSumOfDay(day, sum) {
      //console.log("Update Date's Duration Sum of",day,"to",sum)
      let prev_sum = document.getElementById(day)
      //console.log(prev_sum)
      if (prev_sum)
        prev_sum.innerText = sum
    }

    function updateSpentTimeOfDay(day, sum) {
      console.log("Udpating", day, "to", sum)
      let prev_sum = document.getElementById(day)
      if (prev_sum)
        prev_sum.innerText = sum
    }

    Number.prototype.pad = function (size) {
      let s = String(this);
      while (s.length < (size || 2)) { s = "0" + s; }
      return s;
    }

    function closePrint() {
      document.body.removeChild(this.__container__)
    }

    function setPrint() {
      this.contentWindow.__container__ = this;
      this.contentWindow.onbeforeunload = closePrint;
      this.contentWindow.onafterprint = closePrint;
      this.contentWindow.focus(); // Required for IE
      this.contentWindow.print();
    }

    function printPDF(pdf) {
      let iframe = document.createElement("iframe");
      iframe.onload = setPrint;
      iframe.style.display = "none";
      iframe.src = pdf;
      document.body.appendChild(iframe);
    }

    let php_date = "<?php if (isset($selectedDate)) {
      echo $selectedDate;
    } ?>";



  </script>
  <script src="js/config.js" defer></script>
  <script src="js/helpers.js" defer></script>
  <script src="js/api.js" defer></script>
  <script src="js/categorySidebar.js" defer></script>
  <script src="js/taskModal.js" defer></script>
  <script src="js/addNewTaskModal.js" defer></script>
  <script src="js/Notification.js" playBell="<?php echo isset($_GET['bell']) ? "true" : "false"; ?>" defer></script>
  <script src="js/timetable.js" defer></script>
  <script src="js/calendar.js" defer></script>
  <script src="js/header.js" defer></script>
  <script src="js/habits.js" defer></script>
  <script src="https://kit.fontawesome.com/06843879cb.js" crossorigin="anonymous"></script>
  <script src="https://unpkg.com/showdown/dist/showdown.min.js"></script>

  <script src="https://unpkg.com/vue@next"></script>
  <script src="vue/main.js" defer></script>

</head>
<div id="sound" style="display: none"></div>

<header>
  <p class="title"></p>
  <button type="button" name="startStop">START</button>
  <div class="time">00:00:00</div>
  <input class="time disabled" type="text" name="timer" value="" placeholder="Add/Substract Time in Seconds">
  <button type="button" name="endTask">BEENDEN</button>
  <div class="times">
    <p class="startTime">start</p>
    <p class="endTime">ende</p>
  </div>
</header>

<div id="sidebar">
  <ul id="categories">
    <a href='?'>
      <li>All Tasks</li>
    </a>
    <hr>
    <?php
    // $sql = "SELECT * FROM `category` WHERE display = 1";
// $cats = mysqli_query($db, $sql);
    
    // if(mysqli_num_rows($cats)>0) {
//   while($row = mysqli_fetch_assoc($cats)) {
//     $cat_id = $row['ID'];
//     $cat_bez = $row['Bezeichnung'];
//     $color = $row['color'];
//     if(empty($color)) {
//       $color = "777";
//     }
//     echo "<a href='?category=$cat_id'><li><div class='categoryIndicator' style='--color: #$color'></div>$cat_bez</li></a>";
//   }
// }
    

    ?>
  </ul>
  <hr>
  <ul>
    <li>Drucksachen</li>
    <a href="#" onclick="printPDF('../plans/DayTodoPlanII.pdf')">
      <li>> Pomodoro DayPlan</li>
    </a>
    <a href="#" onclick="printPDF('../plans/WochenToDo.pdf')">
      <li>> Wochenstatistik</li>
    </a>
    <a href="#" onclick="printPDF('../plans/Wochenplan2.pdf')">
      <li>> Stundenplan</li>
    </a>
    <a href="#" onclick="printPDF('../plans/dayTodoWeekPlan2Printable.pdf')">
      <li>> Tages Todo Faltware</li>
    </a>
  </ul>
  <hr>
  <ul>
    <a href="?timetable">
      <li>Timetable</li>
    </a>
    <a href="?habits">
      <li>Habit Tracker</li>
    </a>
    <!-- <a href="?calendar"><li>Calendar</li></a> -->
  </ul>
  <hr>
  <ul>
    <a href="?yesterday">
      <li>Gestern</li>
    </a>
    <a href="?today">
      <li>Heutige Aufgaben</li>
    </a>
    <a href="?tomorrow">
      <li>Morgen</li>
    </a>
  </ul>
  <hr>
  <ul>
    <a href="?search">
      <li>Search <i class="fas fa-search small"></i></li>
    </a>
    <a href="?bahnapi">
      <li>BahnAPI</li>
    </a>
    <a href="?settings">
      <li>Settings</li>
    </a>
    <a href="?youtube">
      <li>Youtube History</li>
    </a>
  </ul>
</div>
<main>

  <?php if (isset($_GET['timetable'])) { ?>

    <canvas id="timetable"></canvas>
  </main>

<?php } else if (isset($_GET['settings'])) {
    require_once("./settings.php")
      ?>
    </main>

<?php } else if (isset($_GET['bahnapi'])) {
    require_once("./bahnapi.php")
      ?>
      </main>

<?php } else if (isset($_GET['habits'])) {
    require_once("./habits.php")
      ?>
        </main>

<?php } else if (isset($_GET['search'])) {
    require_once("./search.php")
      ?>
          </main>

<?php } else if (isset($_GET['youtube'])) {
    require_once("./youtube-history.php")
      ?>
            </main>

<?php } else if (isset($_GET['calendar'])) { ?>
              <canvas id="calendar"></canvas>
              </main>

<?php } else { ?>

              <div id="tasks">

                <center>
                  <h2>Open Tasks:</h2>
                </center>
                <table>
                  <!-- <tr>
    <th>Name</th>
    <th>Description</th>
    <th>DaysLeft</th>
    <th>DueDate</th>
    <th>DueTime</th>
    <th>Duration</th>
    <th></th>
  </tr> -->

        <?php
        /**

        ADDING CURRENT THE EVENTS

        */
        $weather = getForecast();

        $day = 0;
        $duration_sum = 0;
        $spent_time_daysum = 0;
        if (mysqli_num_rows($result) > 0) {
          while ($row = mysqli_fetch_assoc($result)) {
            $ID = $row['ID'];
            $name = urldecode($row['Name']);
            $desc = urldecode(str_replace("\n", "<br>", $row['description']));
            $DaysLeft = $row['daysLeft'];
            $DueDate = $row['due'];
            $category = $row['category'];
            $DueTime = $row['due_time'];
            $Duration = $row['duration'];
            $Duration2 = $row['duration2'];
            $priority = $row['priority'];
            $difficulty = $row['difficulty'];
            $Location = $row['location'];
            $color = $row['color'];
            if (empty($color)) {
              $color = "777";
            }
            $setNewDate = "";
            $exclamation = "";
            if ($priority == 10) {
              $exclamation = " <b>❗</b>";
            }

            $duration_sum += $Duration2;

            if ($DaysLeft >= 0) {
              if ($day != $DueDate) {

                $daysOfWeek = array("Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag");
                $dow = $daysOfWeek[$row['DOW'] - 1];
                $date_text = date("d.m.Y", strtotime($DueDate));

                //update duration sum of previous day
                echo "<script>updateDurationSumOfDay('daysum_" . $day . "', $duration_sum)</script>";

                // $time_spent_day_sum_sql = "SELECT SUM(time_spent) as sum FROM `tasks` WHERE (done IS NULL AND due = '$DueDate') OR DATE(done) = '$DueDate'";
                $time_spent_day_sum_sql = "SELECT SUM(time_spent) as sum FROM `tasks`
                                      JOIN (SELECT taskID, SUM(TIMESTAMPDIFF(SECOND, start_time, IFNULL(stop_time, CURRENT_TIME))) as time_spent FROM `task_history` WHERE (DATE(start_time) = '$DueDate') GROUP BY taskID) as b ON tasks.ID = b.taskID
                                      WHERE (done IS NULL AND due = '$DueDate') OR DATE(done) = '$DueDate'";

                $time_spent_day_sum_res = mysqli_query($db, $time_spent_day_sum_sql);
                $time_spent_day_sum_string = "";
                if (mysqli_num_rows($time_spent_day_sum_res) > 0) {
                  $time_spent_day_sum_secs = mysqli_fetch_assoc($time_spent_day_sum_res)['sum'];

                  $time_spent_day_sum_minutes = str_pad(floor($time_spent_day_sum_secs / 60 % 60), 2, '0', STR_PAD_LEFT);
                  $time_spent_day_sum_hours = floor($time_spent_day_sum_secs / 60 / 60);

                  $time_spent_day_sum_string = "(" . $time_spent_day_sum_hours . ":" . $time_spent_day_sum_minutes . ")";
                }

                // Difficulty Scoring
                $difficulty_score_of_day_sql = "SELECT DATE(start_time) as Datum, SUM(TIMESTAMPDIFF(MINUTE, task_history.start_time, IFNULL(task_history.stop_time, CURRENT_TIMESTAMP)) / 60 * difficulty) as score 
                                          FROM `task_history` LEFT JOIN tasks on task_history.taskID = tasks.ID 
                                          WHERE DATE(start_time) = '$DueDate' GROUP BY `Datum`;";
                $difficulty_score_of_day_res = mysqli_query($db, $difficulty_score_of_day_sql);
                $difficulty_score_of_day_string = "";
                if (mysqli_num_rows($difficulty_score_of_day_res) > 0) {
                  $difficulty_score_of_day_string = "[" . round((float) mysqli_fetch_assoc($difficulty_score_of_day_res)['score'], 1) . "]";
                }


                $sunrise = date_sunrise(strtotime($DueDate), SUNFUNCS_RET_STRING, 50.620721, 6.960079, 90, 1);
                $sunset = date_sunset(strtotime($DueDate), SUNFUNCS_RET_STRING, 50.620721, 6.960079, 90, 1);
                $sunset_dark = date_sunset(strtotime($DueDate), SUNFUNCS_RET_STRING, 50.620721, 6.960079, 102, 1);

                $weatherInfo = "";
                foreach ($weather as $wd) {
                  if (!(intval(date_diff(new DateTime("now"), new DateTime($DueDate))->format("%a")) > 3)) { //Eigentlich >5, aber scheinbar muss es >3 sein :laugh:
                    $weatherInfo = $weather[$DueDate][1] . "°C bis " . $weather[$DueDate][2] . "°C";
                  }
                }

                if ($DaysLeft == 0) {
                  $currentTemp = getCurrentTemp() . "°C";
                  $weatherInfo = "(" . $weatherInfo . ")";
                } else {
                  $currentTemp = "";
                }

                echo "
            <tr date>
              <td>$dow - $date_text $time_spent_day_sum_string $difficulty_score_of_day_string</td>
              <td></td>
              <td>$currentTemp $weatherInfo</td>
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
              if ($DaysLeft == 0) {
                // $setNewDate = " :: <a href='tasks.php?setNewDate=tomorrow&ID=$ID&$category&$day'>Auf morgen verschieben</a>";
              }
            } else {
              if (!isset($category)) {
                $category = "";
              }
              // $setNewDate = " :: Auf <a href='tasks.php?setNewDate=today&ID=$ID&$category&$day'>heute</a> / <a href='tasks.php?setNewDate=tomorrow&ID=$ID&$category&$day'>morgen</a> verschieben";
            }

            /*if(!empty($DueTime) && $DaysLeft == 0) {
              $DueTime = $DueTime."<script>addNotification(\"$DueDate\", \"$DueTime\", \"$name. ($ID)\");</script>";
            }*/

            $time_spent_string = "";
            $time_spent = $row['time_spent'];
            if ($time_spent > 0) {
              if ($category != 12) {
                $spent_time_daysum += $time_spent;
              }
              $minutes = str_pad(floor($time_spent / 60 % 60), 2, '0', STR_PAD_LEFT);
              $hours = floor($time_spent / 60 / 60);

              $time_spent_string = " ($hours:$minutes)";
            }
            $difficulty_string = "";
            if ($difficulty != NULL && $difficulty > 1) {
              $difficulty_string = " [" . $difficulty . "]";
            }

            echo "
        <tr priority='$priority'>
          <td onclick='openModal($ID)' class='clickable'><div class='categoryIndicator' style='--color: #$color'></div>$name$exclamation$time_spent_string$difficulty_string</td>
          <td onclick='openModal($ID)' class='clickable'><p class='description'>$desc</p></td>
          <td><p id='timeLeft_$ID'>$DaysLeft</p> $setNewDate</td>
          <td>$Location</td>
          <td>$DueTime</td>
          <td>$Duration</td>
          <td><a href='tasks.php?doneID=$ID&category=$category&$curSelDay&prefix=$prefix'>&#10004;</a></td>
        </tr>
    ";
          }
          echo "<script>updateDurationSumOfDay('daysum_" . $day . "', $duration_sum)</script>";
        }


        ?>
                  <!-- <tr>
  <form method="get">
    <td><input type="text" name="name" placeholder="Name" required <?php if (isset($_GET['activeInput'])) {
      echo "autofocus";
    } ?>/></td>
    <td><textarea name="desc" placeholder="Description"></textarea></td>
    <td><input tpye="number" min="0" max="10" name="priority" placeholder="priority (0-10)" required value="5"/></td>
    <td><input type="date" name="duedate" required value="<?php echo (new Datetime('tomorrow'))->format('Y-m-d') ?>"/></td>
    <td><input type="time" name="duetime"/></td>
    <td><input type="time" name="duration"/></td>
    <td><input type="submit" value="&#10148;"</td>
    <input type="hidden" name="category" value="<?php if (isset($category)) {
      echo $category;
    } else
      echo "0"; ?>">
  </form>
</tr> -->

                </table>


                <!-- Finished Tasks -->

                <br>
                <center>
                  <h2>Finished Tasks:</h2>
                </center>
                <table>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Duration</th>
                    <th>DueDateTime</th>
                    <th>DoneDateTime</th>
                    <th>DaysAgo</th>
                    <th>Difficulty</th>
                    <th></th>
                  </tr>

        <?php
        $day_sel = "AND TIMESTAMPDIFF(DAY, done, NOW()) < 7";
        if (isset($_GET['today'])) {
          $day_sel = "AND DATE(done) = CURRENT_DATE";
        }
        if (isset($_GET['tomorrow'])) {
          $day_sel = "AND DATE(done) = CURRENT_DATE+1";
        }
        if (isset($_GET['yesterday'])) {
          $day_sel = "AND DATE(done) = CURRENT_DATE-1";
        }
        if (isset($_GET['date'])) {
          $selectedDate = $_GET['date'];
          $day_sel = "AND DATE(done) = '" . $selectedDate . "'";
        }

        $sql = "SELECT tasks.ID, Name, description, difficulty, done, duration, priority, IF(due_time IS NOT NULL, TIMESTAMP(due, due_time), TIMESTAMP(due)) AS due,
          TIMESTAMPDIFF(DAY,(IF(due_time IS NOT NULL, TIMESTAMP(due, due_time), TIMESTAMP(due))), done) as timeDiff, TIMESTAMPDIFF(DAY, done, NOW()) AS DaysAgo, color, IFNULL(time_spent, 0) as time_spent
          FROM `tasks`
          JOIN category ON category.ID = tasks.category
          LEFT JOIN (SELECT taskID, SUM(TIMESTAMPDIFF(SECOND, start_time, IFNULL(stop_time, CURRENT_TIMESTAMP))) as time_spent FROM `task_history` GROUP BY taskID) as b ON tasks.ID = b.taskID
          WHERE done IS NOT NULL $cat_sel $day_sel AND deleted = 0 AND Name LIKE '$prefix%'
          ORDER BY done desc, priority desc";


        // $sql = "SELECT tasks.ID, Name, time_spent, description, done, duration, priority, IF(due_time IS NOT NULL, TIMESTAMP(due, due_time), TIMESTAMP(due)) AS due, TIMESTAMPDIFF(DAY,(IF(due_time IS NOT NULL, TIMESTAMP(due, due_time), TIMESTAMP(due))), done) as timeDiff, TIMESTAMPDIFF(DAY, done, NOW()) AS DaysAgo, color
//           FROM `tasks`
//           JOIN category ON category.ID = tasks.category
//           WHERE done IS NOT NULL $cat_sel $day_sel
//           ORDER BY done desc, priority desc";
// echo $sql;
        $result = mysqli_query($db, $sql);



        $past_tasks_spent_sum_sql = "SELECT SUM(time_spent) as sum FROM `tasks`
                              JOIN (SELECT taskID, SUM(TIMESTAMPDIFF(SECOND, start_time, IFNULL(stop_time, CURRENT_TIME))) as time_spent FROM `task_history` GROUP BY taskID) as b ON tasks.ID = b.taskID
                              WHERE done IS NOT NULL $cat_sel $day_sel AND deleted = 0 AND Name LIKE '$prefix%'";

        // echo $past_tasks_spent_sum_sql;
      
        $past_tasks_spent_sum_res = mysqli_query($db, $past_tasks_spent_sum_sql);
        $past_tasks_spent_sum_string = "";
        if (mysqli_num_rows($past_tasks_spent_sum_res) > 0) {
          $past_tasks_spent_sum_secs = mysqli_fetch_assoc($past_tasks_spent_sum_res)['sum'];

          $past_tasks_spent_sum_minutes = str_pad(floor($past_tasks_spent_sum_secs / 60 % 60), 2, '0', STR_PAD_LEFT);
          $past_tasks_spent_sum_hours = floor($past_tasks_spent_sum_secs / 60 / 60);

          $past_tasks_spent_sum_string = "(" . $past_tasks_spent_sum_hours . ":" . $past_tasks_spent_sum_minutes . ")";
        }

        // Difficulty Scoring
        $past_difficulty_score_of_day_sql = "SELECT DATE(start_time) as Datum, SUM(TIMESTAMPDIFF(MINUTE, task_history.start_time, IFNULL(task_history.stop_time, CURRENT_TIMESTAMP)) / 60 * difficulty) as score 
                                  FROM `task_history` LEFT JOIN tasks on task_history.taskID = tasks.ID 
                                  WHERE done IS NOT NULL $cat_sel $day_sel GROUP BY `Datum`;";
        $past_difficulty_score_of_day_res = mysqli_query($db, $past_difficulty_score_of_day_sql);
        $past_difficulty_score_of_day_string = "";
        if (mysqli_num_rows($past_difficulty_score_of_day_res) > 0) {
          $past_difficulty_score_of_day_string = "[" . round((float) mysqli_fetch_assoc($past_difficulty_score_of_day_res)['score'], 1) . "]";
        }



        $date_string = "Last 7 Days";
        if ($day_sel != "AND TIMESTAMPDIFF(DAY, done, NOW()) < 7") {
          $date_string = $date_text;
        }

        echo "
    <tr date>
      <td>$date_string $past_tasks_spent_sum_string $past_difficulty_score_of_day_string</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
";

        if (mysqli_num_rows($result) > 0) {
          while ($row = mysqli_fetch_assoc($result)) {
            $ID = $row['ID'];
            $name = urldecode($row['Name']);
            $desc = urldecode(str_replace("\n", "<br>", $row['description']));
            $duration = "";
            if (isset($row['duration'])) {
              $duration = $row['duration'];
            }
            $due = $row['due'];
            $done = $row['done'];
            $ago = $row['DaysAgo'];
            $timediff = $row['timeDiff'];
            $priority = $row['priority'];
            $difficulty = $row['difficulty'];
            if (empty($row['color'])) {
              $color = "777";
            } else {
              $color = $row['color'];
            }

            $time_spent = $row['time_spent'];
            if ($time_spent > 0) {
              $minutes = str_pad(floor($time_spent / 60 % 60), 2, '0', STR_PAD_LEFT);
              $hours = floor($time_spent / 60 / 60);

              $time_spent_string = "($hours:$minutes)";
            } else {
              $time_spent_string = "";
            }

            echo "
        <tr priority='$priority'>
          <td onclick='openModal($ID)' class='clickable'><div class='categoryIndicator' style='--color: #$color'></div>$name $time_spent_string</td>
          <td onclick='openModal($ID)' class='clickable'>$desc</td>
          <td></td>
          <td>$due</td>
          <td>$done</td>
          <td>$ago</td>
          <td>[$difficulty]</td>
          <td><a href='tasks.php?revive=$ID&category=$category&$curSelDay'>&#10004;</a></td>
        </tr>
    ";

          }
        }


        ?>

                </table>
              </div>

              <div id="day_timetable"></div>

              </main>



<?php } ?>

<div id="taskModal" class="taskModal disabled">
  <div class="container">
    <div class="header">
      <p class="small" onclick="deleteTask()"><i class="fas fa-trash"></i></p>
      Aufgabe <p id="taskmodal_id">ID</p> bearbeiten (<p id="taskmodal_created"></p>)
      <p class="float-right" onclick="closeTaskModal()">[X]</p>
      <p class="small float-right" onclick="toggleNotes()">
        <i class="fas fa-book"></i>
      </p>
    </div>
    <div class="main">
      <div class="settings flex-one">
        <h1 class="flex-two">Titel</h1>
        <input type="text" name="title" value="title" class="disabled bigInput">
        <p class="description flex-one"></p>
        <textarea name="description" rows="4" cols="80" class="disabled flex-one"></textarea>
        <h1 class="smallInput location">Location</h1>
        <input class="disabled smallInput" type="text" name="location" placeholder="Location">
      </div>
      <hr>
      <div class="deadline">
        <label>Deadline: <input type="date" name="due-date"><input type="time" name="due-time"></label>
        <label>Duration: <input type="time" name="duration"></label>
        <label>Category: <select class="mobilBigInput" name="category"></select></label>
        <label>Priority: <select class="mobilBigInput" name="priority"></select></label>
        <label>Difficulty: <select class="mobilBigInput" name="difficulty"></select></label>
      </div>
      <hr>
      <div class="timer">
        <div class="time">00:00:00</div>
        <input class="time disabled" type="text" name="timer" value="" placeholder="Add/Substract Time in Seconds">
        <div class="buttonGroup">
          <button type="button" name="startStop">START</button>
          <button type="button" name="resetTimer"><i class="fa fa-redo"></i></button>
        </div>
        <button type="button" name="endTask">Aufgabe beenden</button>
      </div>
    </div>
  </div>
  <div class="side right notes disabled">
    <h1 class="title"></h1>
    <p class="content flex-one" onclick="taskNoteEdit()"></p>
    <textarea class="content"></textarea>
  </div>
  <!-- <div class="side left notes">
    <textarea id="task_notes"></textarea>
  </div> -->

</div>

<div id="addNewTaskModal" class="taskModal disabled">
  <div class="container">
    <div class="header">
      Neue Aufgabe erstellen
      <p id="closeAddNewTaskModal" class="float-right">[X]</p>
    </div>
    <div class="main">
      <div class="settings flex-one">
        <input class="bigInput" type="text" name="title" placeholder="Title" required>
        <textarea class="flex-one" name="description" rows="4" cols="80" placeholder="Description"></textarea>
        <input class="smallInput" type="text" name="location" placeholder="Location">
      </div>
      <hr>
      <div class="settings">
        <label>Category: <select class="mobilBigInput" name="category"></select></label>
        <label>Priority: <select class="mobilBigInput" name="priority"></select></label>
      </div>
      <hr>
      <div class="settings">
        <label>Deadline: <input class="margin-left" type="date" name="due-date"><input class="margin-left" type="time"
            name="due-time"></label>
        <label>Duration: <input class="margin-left" type="time" name="duration"></label>
      </div>
      <hr>
      <div class="save">
        <button type="button" name="save">Speichern</button>
        <button type="button" name="save-and-start">Speichern und sofort starten [Strg+Enter]</button>
      </div>
    </div>
  </div>
</div>

<?php if (isset($_GET['timetable'])) { ?>

  <div id="printTimetableButton" class="overlaybutton">
    <i class="fas fa-print"></i>
  </div>

<?php } ?>

<div id="openMHealthModal" class="overlaybutton">
  <i class="fas fa-traffic-light"></i>
</div>

<div id="openNewTimerModal" class="overlaybutton">
  <i class="fas fa-stopwatch"></i>
</div>

<div id="openNewTaskModal" class="overlaybutton">
  <i class="fas fa-plus"></i>
</div>

<div id="openSidebar" onclick="document.getElementById('sidebar').classList.add('open')" class="overlaybutton left">
  <i class="fas fa-bars"></i>
</div>

<!-- <div id="components-demo">
  <mymodal></mymodal>
</div> -->