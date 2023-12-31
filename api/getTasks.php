<?php

$globals["database_name"] = "j_tasks";
require_once("../includes/db_connection.php");

$db = $globals['db'];


$day_sel = "";
if (isset($_GET['date'])) {
  $day_sel = "AND due = '" . $_GET['date'] . "'";
}

if (isset($_GET['today']) || $day_sel == "") {
  $day_sel = "AND due = CURRENT_DATE";
}

$cat_sel = "";
if (empty($day)) {
  if (isset($_GET['category'])) {
    $category = $_GET['category'];
    $cat_sel = "AND category = $category";
  }
}

$prefix_sel = "";
if (isset($_GET['prefix'])) {
  $prefix_sel = "AND Name LIKE '$prefix%'";
}


// SELECT tasks.ID, tasks.done, Name, description, due, due_time, DAYOFWEEK(due) AS DOW, duration, TIMESTAMPDIFF(DAY, NOW(), due) AS daysLeft, if(CURRENT_DATE>due, 11, priority) as priority, color 

$sql = "SELECT tasks.ID, tasks.done, Name, description, due, due_time, DAYOFWEEK(due) AS DOW, duration, (HOUR(duration) + (MINUTE(duration)/60)) as duration2, TIMESTAMPDIFF(DAY, NOW(), due) AS daysLeft, if(CURRENT_DATE>due, 11, priority) as priority, difficulty, color, IFNULL(time_spent_new, 0) as time_spent, category, location
          FROM `tasks`
          JOIN category ON tasks.category = category.ID
          LEFT JOIN (SELECT taskID, SUM(TIMESTAMPDIFF(SECOND, start_time, IFNULL(stop_time, CURRENT_TIMESTAMP))) as time_spent_new FROM `task_history` GROUP BY taskID) as b ON tasks.ID = b.taskID
          WHERE deleted = 0 $cat_sel $day_sel $prefix_sel
          ORDER BY due ASC, due_time ASC, priority DESC, category";
$result = mysqli_query($db, $sql);


$rows = array();
while ($r = mysqli_fetch_assoc($result)) {
  $rows[] = $r;
}

header('Content-Type: application/json');

print json_encode($rows);


?>