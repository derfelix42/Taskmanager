<?php

$globals["database_name"] = "j_tasks";
require_once("../includes/db_connection.php");

$db = $globals['db'];

$sql = "INSERT INTO `sleep_history` (`ID`, `start_time`, `stop_time`) VALUES (NULL, NOW(), NULL)";
mysqli_query($db, $sql);



?>
