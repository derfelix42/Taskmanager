<?php

$globals["database_name"] = "j_tasks";
require_once("../includes/db_connection.php");

$db = $globals['db'];

$sql = "";

$data = "";

function endAllRunningTasks() {
  GLOBAL $db, $sql;
  $sql = "UPDATE `task_history` SET `stop_time`= CURRENT_TIMESTAMP WHERE stop_time IS NULL";
  mysqli_query($db, $sql);
}

function endOneRunningTasks($ID) {
  GLOBAL $db, $sql;
  $sql = "UPDATE `task_history` SET `stop_time`= CURRENT_TIMESTAMP WHERE taskID = $ID AND stop_time IS NULL";
  mysqli_query($db, $sql);
}

if(isset($_GET['taskID'])) {
  $ID = $_GET['taskID'];

  if(isset($_GET['start'])) {
    // print("START");
    endAllRunningTasks();

    //Check if Task has been stop less than a minute before
    $bridge_time = 60;
    $sql = "SELECT ID FROM `task_history` WHERE taskID = '$ID' AND DATE(start_time) = CURRENT_DATE AND TIMESTAMPDIFF(Second, stop_time, CURRENT_TIME) < '$bridge_time' ORDER BY `ID`  DESC LIMIT 1";
    $result = mysqli_query($db, $sql);
    if(mysqli_num_rows($result) > 0) {
      $row = mysqli_fetch_assoc($result);
      $prevID = $row['ID'];
      $sql = "UPDATE `task_history` SET `stop_time`= NULL WHERE ID = '$prevID'";
    } else {
      $sql = "INSERT INTO `task_history` (`ID`, `taskID`, `start_time`, `stop_time`) VALUES (NULL, '$ID', CURRENT_TIMESTAMP, NULL);";
    }

    mysqli_query($db, $sql);
  }

  if(isset($_GET['stop'])) {
    //print("STOP");
    endOneRunningTasks($ID);
  }

  if(isset($_GET['time'])) {
    $sql = "SELECT taskID, SUM(TIMESTAMPDIFF(SECOND, start_time, IFNULL(stop_time, CURRENT_TIMESTAMP)))) as time_spent FROM `task_history` WHERE taskID = $ID GROUP BY taskID";
    $result = mysqli_query($db, $sql);
    $row = mysqli_fetch_assoc($result);

    $data = json_encode($row);
  }
}

if(isset($_GET['activeTask'])) {
  $sql = "SELECT taskID FROM `task_history` WHERE stop_time IS NULL ORDER BY start_time DESC LIMIT 1";
  $result = mysqli_query($db, $sql);
  if(mysqli_num_rows($result) > 0) {
    $row = mysqli_fetch_assoc($result);

    $data = $row;
  } else {
    $data = ['taskID' => -1];
  }
}



header('Content-Type: application/json');
if($data != "") {
  $response = ["status" => "done", "sql" => $sql, "data" => $data];
  print(json_encode($response));
  //print "{'status': 'done', 'sql': '$sql', 'data': '$data'}";
} else {
  print "{'status': 'done', 'sql': '$sql'}";
}
?>
