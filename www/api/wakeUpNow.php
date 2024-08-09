<?php

$globals["database_name"] = "j_tasks";
require_once("../includes/db_connection.php");

$db = $globals['db'];

$sql = "UPDATE `sleep_history` SET `stop_time` = NOW() WHERE stop_time IS NULL;";
mysqli_query($db, $sql);



?>
