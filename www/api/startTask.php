<?php

$globals["database_name"] = "j_tasks";
require_once("../includes/db_connection.php");

$db = $globals['db'];

$name = $_GET['name'];



function getTaskByName($name) {
  global $db;
  $sql = "SELECT * from tasks
            WHERE tasks.name LIKE '%$name%' AND due = CURRENT_DATE AND done IS NULL AND tasks.name NOT LIKE '%Konferenz%'";
  $result = mysqli_query($db, $sql);
  $row = mysqli_fetch_assoc($result);
  return $row;
}

$task = getTaskByName($name);
if($task == null) {
  // create new task
  $sql = "INSERT INTO `tasks` (`ID`, `Name`, `description`, `due`, `priority`, `category`) VALUES (NULL, '$name', '', CURRENT_DATE, 5, 0);";
  mysqli_query($db, $sql);
  // get task
  $task = getTaskByName($name);
}

// start Timer on Task with ID


// done



//header('Content-Type: application/json');


if($task == null) {
  echo "{'error': 'fail'}";
} else {

  header("Location: taskHistory.php?start&taskID=".$task["ID"]);


}



// if(isset($_GET['ID'])) {
//   $ID = $_GET['ID'];
//   $changes = array();
//   if(isset($_GET['title'])){
//     array_push($changes, "`Name` = '".$_GET['title']."'");
//   }
//   if(isset($_GET['description'])){
//     array_push($changes, "`description` = '".$_GET['description']."'");
//   }
//   if(isset($_GET['time_spent'])){
//     array_push($changes, "`time_spent` = '".$_GET['time_spent']."'");
//   }
//   if(isset($_GET['due'])){
//     array_push($changes, "`due` = '".$_GET['due']."'");
//   }
//   if(isset($_GET['due_time'])){
//     array_push($changes, "`due_time` = '".$_GET['due_time']."'");
//   }
//   if(isset($_GET['duration'])){
//     array_push($changes, "`duration` = '".$_GET['duration']."'");
//   }
//
//
//   $changes_string = implode(",", $changes);
//
//   $sql = "UPDATE `tasks` SET $changes_string WHERE `tasks`.`ID` = '$ID'";
//   mysqli_query($db, $sql);
// }
//
//
//
//
// print "{'status': 'done', 'sql': '$sql'}";
?>
