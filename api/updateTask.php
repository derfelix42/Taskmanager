<?php

$globals["database_name"] = "j_tasks";
require_once("../includes/db_connection.php");

$db = $globals['db'];

$sql = "";

if(isset($_GET['ID'])) {
  $ID = $_GET['ID'];
  $changes = array();
  if(isset($_GET['title'])){
    array_push($changes, "`Name` = '".urldecode($_GET['title'])."'");
  }
  if(isset($_GET['description'])){
    array_push($changes, "`description` = '".urldecode($_GET['description'])."'");
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
  if(isset($_GET['duration'])){
    array_push($changes, "`duration` = '".$_GET['duration']."'");
  }
  if(isset($_GET['category'])){
    array_push($changes, "`category` = '".$_GET['category']."'");
  }
  if(isset($_GET['priority'])){
    array_push($changes, "`priority` = '".$_GET['priority']."'");
  }
  if(isset($_GET['location'])){
    array_push($changes, "`location` = '".$_GET['location']."'");
  }
  if(isset($_GET['deleted'])){
    array_push($changes, "`deleted` = '".$_GET['deleted']."'");
  }
  if(isset($_GET['difficulty'])){
    array_push($changes, "`difficulty` = '".$_GET['difficulty']."'");
  }


  $changes_string = implode(",", $changes);

  $sql = "UPDATE `tasks` SET $changes_string WHERE `tasks`.`ID` = '$ID'";
  mysqli_query($db, $sql);
}



header('Content-Type: application/json');

print "{'status': 'done', 'sql': '$sql'}";
?>
