<?php

$globals["database_name"] = "j_tasks";
require_once("../includes/db_connection.php");

$db = $globals['db'];


if(isset($_GET['date'])) {
  $date = $_GET['date'];

  $sql = "SELECT start_time, IFNULL(stop_time, NOW()) as stop_time, stop_time IS NULL AS is_active,  DAYOFWEEK(start_time) as sleep_dow, DAYOFWEEK(IFNULL(stop_time, NOW())) as wakeup_dow, TIME(start_time) as sleep_time, TIME(IFNULL(stop_time, NOW())) as wakeup_time, TIMESTAMPDIFF( SECOND, start_time, IFNULL(stop_time, NOW()) ) AS sleep_secs, SEC_TO_TIME(TIMESTAMPDIFF(SECOND, start_time, IFNULL(stop_time, NOW()))) AS sleep_hours FROM `sleep_history` WHERE (WEEK(start_time, 1) = WEEK('$date', 1) OR WEEK(IFNULL(stop_time, NOW()), 1) = WEEK('$date', 1)) AND (YEAR(start_time) = YEAR('$date') OR YEAR(IFNULL(stop_time, NOW())) = YEAR('$date')) ORDER BY start_time ASC;";
  $result = mysqli_query($db, $sql);


  $rows = array();
  while($r = mysqli_fetch_assoc($result)) {
    $rows[] = $r;
  }

  header('Content-Type: application/json');

  print json_encode(["sql" => $sql, "data" => $rows]);
}


?>
