<?php

$globals["database_name"] = "j_tasks";
require_once("includes/db_connection.php");
include_once("includes/weatherApi.php");

if(isset($_GET['name'])) {
  $name = htmlentities($_GET['name']);
  $desc = htmlentities($_GET['desc']);
  $duedate = "'".$_GET['duedate']."'";
  $duetime = (!empty($_GET['duetime']) ? "'".$_GET['duetime']."'": "NULL");
  $duration = (!empty($_GET['duration']) ? "'".$_GET['duration']."'": "NULL");
  $priority = $_GET['priority'];
  $category = $_GET['category'];
  $sql = "INSERT INTO `tasks` (`ID`, `Name`, `description`, `due`, `due_time`, `done`, `duration`, `priority`, `category`) VALUES (NULL, '$name', '$desc', $duedate, $duetime, NULL, $duration, '$priority', '$category');";
  mysqli_query($db, $sql);
  exit();
}

?>
