<?php

$globals["database_name"] = "j_tasks";
require_once("../includes/db_connection.php");

$db = $globals['db'];


// if(isset($_GET['date'])) {
//   $date = $_GET['date'];
//   // $sql = "SELECT DAYOFWEEK(date) AS DOW, time FROM `wakeup_times` WHERE WEEK(date,1) = WEEK('$date', 1) AND YEAR(date) = YEAR('$date') AND wake_up = 1 ORDER BY date ASC";

//   // $sql = "SELECT DAYOFWEEK(b.date) AS DOW, b.date as today_date, max(a.time) as yesterday_sleep_time, min(b.time) as wakeup_time, SEC_TO_TIME(TIMESTAMPDIFF(SECOND, max(concat(a.date,' ',a.time)), min(concat(b.date, ' ', b.time)))) as sleep_hours FROM `wakeup_times` as a JOIN wakeup_times as b on a.date = DATE_SUB(b.date, INTERVAL 1 DAY) WHERE a.wake_up = 0 AND b.wake_up = 1 AND WEEK(b.date,1) = WEEK('$date', 1) AND YEAR(b.date) = YEAR('$date') GROUP BY a.date, b.date ORDER BY a.date ASC;";
//   $sql = "SELECT DAYOFWEEK(start_time) AS DOW, DATE(start_time) AS today_date, TIME(start_time) AS yesterday_sleep_time, TIME(stop_time) AS wakeup_time, SEC_TO_TIME( TIMESTAMPDIFF( SECOND, start_time, stop_time ) ) AS sleep_hours FROM `sleep_history` WHERE WEEK(start_time, 1) = WEEK('$date', 1) AND YEAR(start_time) = YEAR('$date') ORDER BY start_time ASC;";

//   $result = mysqli_query($db, $sql);


//   $rows = array();
//   while($r = mysqli_fetch_assoc($result)) {
//     $rows[] = $r;
//   }

//   header('Content-Type: application/json');

//   print json_encode(["sql" => $sql, "data" => $rows]);
// }

print json_encode(["status" => "error", "sql" => "", "data" => []]);

?>
