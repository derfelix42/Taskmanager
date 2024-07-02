<div id="tasks">

  <center>
    <h2>Restore deleted Tasks:</h2>
  </center>


</div>

<?php
$globals["database_name"] = "j_tasks";
require_once("includes/db_connection.php");
$db = $globals['db'];

// Revive a task (uncheck task)
if (isset($_GET['restore'])) {
  $ID = $_GET['restore'];
  $sql = "UPDATE `tasks` SET `deleted` = 0 WHERE `tasks`.`ID` = '$ID'";
  mysqli_query($db, $sql);
  header("Location: tasks.php?trash");
  // echo "Error restoring ID ".$ID;
  exit();
}

$sql = "SELECT tasks.ID, Name, description, due, due_time, DAYOFWEEK(due) AS DOW, duration, (HOUR(duration) + (MINUTE(duration)/60)) as duration2, TIMESTAMPDIFF(DAY, NOW(), due) AS daysLeft, priority, difficulty, color, IFNULL(time_spent_new, 0) as time_spent, category, location FROM `tasks` JOIN category ON tasks.category = category.ID LEFT JOIN (SELECT taskID, SUM(TIMESTAMPDIFF(SECOND, start_time, IFNULL(stop_time, CURRENT_TIMESTAMP))) as time_spent_new FROM `task_history` GROUP BY taskID) as b ON tasks.ID = b.taskID WHERE deleted = 1 ORDER BY due ASC, due_time ASC, priority DESC, category;";
$result = mysqli_query($db, $sql);

?>


<table>

  <?php



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
          <td><div class='categoryIndicator' style='--color: #$color'></div>$name $time_spent_string</td>
          <td>$desc</td>
          <td></td>
          <td>$due</td>
          <td>$done</td>
          <td>$ago</td>
          <td>[$difficulty]</td>
          <td><a href='tasks.php?trash&restore=$ID'>
            <i class='fas fa-clock-rotate-left'></i>
          </a></td>
        </tr>
    ";
    }
  }


  ?>

</table>
</div>