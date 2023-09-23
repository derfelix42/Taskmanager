<?php

$globals["database_name"] = "j_tasks";
require_once("../includes/db_connection.php");

$db = $globals['db'];


$day_sel = "";
if(isset($_GET['today'])) {
  $day_sel = "AND due = CURRENT_DATE";
}

$cat_sel = "";
if(empty($day)) {
  if(isset($_GET['category'])) {
    $category = $_GET['category'];
    $cat_sel = "AND category = $category";
  }
}

$sql = "SELECT tasks.ID, Name, description, due, due_time, DAYOFWEEK(due) AS DOW, duration, TIMESTAMPDIFF(DAY, NOW(), due) AS daysLeft, if(CURRENT_DATE>due, 11, priority) as priority, color FROM `tasks` JOIN category ON tasks.category = category.ID WHERE done IS NULL AND deleted = 0 $cat_sel $day_sel ORDER BY due ASC, due_time ASC, priority DESC, category, Name";
$result = mysqli_query($db, $sql);


$rows = array();
while($r = mysqli_fetch_assoc($result)) {
    $rows[] = $r;
}

header('Content-Type: application/json');

print json_encode($rows);


?>
