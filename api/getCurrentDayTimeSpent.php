<?php

$globals["database_name"] = "j_tasks";
require_once("../includes/db_connection.php");

$db = $globals['db'];

$sql = "SELECT SUM(time_spent) as DaySum FROM `tasks` WHERE due = CURRENT_DATE";
//$sql = "SELECT * FROM `tasks` WHERE ID = 1";
$result = mysqli_query($db, $sql);
$row = mysqli_fetch_assoc($result);

print_r(json_encode($row));

?>
