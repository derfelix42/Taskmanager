<?php

$globals["database_name"] = "j_tasks";
require_once("../includes/db_connection.php");

$db = $globals['db'];

$sql = "";

if(isset($_GET['doneID'])) {
  $doneID = $_GET['doneID'];
  $sql = "UPDATE `tasks` SET `done` = NOW() WHERE `tasks`.`ID` = '$doneID'";
  mysqli_query($db, $sql);
}

header('Content-Type: application/json');

print "{\"status\": \"done\", \"sql\": \"$sql\"}";
?>
