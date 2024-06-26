<?php

$globals["database_name"] = "j_tasks";
require_once("../includes/db_connection.php");

$db = $globals['db'];

if(isset($_GET['getTask'])) {
  $ID = $_GET['getTask'];

  $sql = "SELECT ID, Name, description, due, due_time, done, duration, priority, deleted, created, IFNULL(time_spent, 0) as time_spent, category, location, difficulty
            FROM `tasks` LEFT JOIN (SELECT taskID, SUM(TIMESTAMPDIFF(SECOND, start_time, IFNULL(stop_time, CURRENT_TIMESTAMP))) as time_spent FROM `task_history` GROUP BY taskID) as b ON tasks.ID = b.taskID
            WHERE tasks.ID = $ID";
  $result = mysqli_query($db, $sql);
  $row = mysqli_fetch_assoc($result);

  print_r(json_encode($row));
}

?>
