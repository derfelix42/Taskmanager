<?php

$globals["database_name"] = "j_tasks";
require_once("../includes/db_connection.php");

$db = $globals['db'];

$sql = "SELECT tasks.ID FROM `tasks` RIGHT JOIN task_history ON tasks.ID = task_history.taskID WHERE task_history.start_time IS NOT NULL AND task_history.stop_time IS NULL";

$result = mysqli_query($db, $sql);

header('Content-Type: application/json');

if(mysqli_num_rows($result) > 0) {
	$row = mysqli_fetch_assoc($result);
	$ID = $row['ID'];

	$sql = "UPDATE `task_history` SET `stop_time` = NOW() WHERE `taskID` = '$ID' AND stop_time IS NULL";
	
	mysqli_query($db, $sql);

	print "{\"status\": \"done\", \"sql\": \"$sql\", \"info\": \"Current Task had ID $ID\"}";
} else {
	print "{\"status\": \"done\", \"info\": \"There was no current Task to end!\"}";
}
?>
