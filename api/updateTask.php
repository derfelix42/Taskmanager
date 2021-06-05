<?php

$globals["database_name"] = "j_tasks";
require_once("../includes/db_connection.php");

$db = $globals['db'];

$sql = "";

if(isset($_GET['ID'])) {
  $ID = $_GET['ID'];
  $changes = array();
  if(isset($_GET['title'])){
    array_push($changes, "`Name` = '".$_GET['title']."'");
  }
  if(isset($_GET['description'])){
    array_push($changes, "`description` = '".$_GET['description']."'");
  }
  if(isset($_GET['time_spent'])){
    array_push($changes, "`time_spent` = '".$_GET['time_spent']."'");
  }
  if(isset($_GET['due'])){
    array_push($changes, "`due` = '".$_GET['due']."'");
  }
  if(isset($_GET['due_time'])){
    array_push($changes, "`due_time` = '".$_GET['due_time']."'");
  }

  $changes_string = implode(",", $changes);

  $sql = "UPDATE `tasks` SET $changes_string WHERE `tasks`.`ID` = '$ID'";
  mysqli_query($db, $sql);
}



header('Content-Type: application/json');

print "{'status': 'done', 'sql': '$sql'}";
?>
