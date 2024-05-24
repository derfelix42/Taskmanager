<?php

$globals["database_name"] = "j_tasks";
require_once("../includes/db_connection.php");

$db = $globals['db'];

$sql = "INSERT INTO `wakeup_times` (`ID`, `date`, `time`, `wake_up`) VALUES (NULL, CURRENT_DATE, CURRENT_TIME, '0');";
mysqli_query($db, $sql);



?>
