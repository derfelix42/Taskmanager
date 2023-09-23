<?php

$globals["database_name"] = "j_tasks";
require_once("../includes/db_connection.php");

$db = $globals['db'];
$new = json_decode(file_get_contents('php://input'));

$sql = "";

if(isset($_GET['ID'])) {

  $ID = $_GET['ID'];

  $sql = "SELECT ID, Name, description, due, due_time, done, duration, priority, deleted, created, time_spent+IFNULL(time_spent_new, 0) as time_spent, category, location, difficulty
            FROM `tasks` LEFT JOIN (SELECT taskID, SUM(TIMESTAMPDIFF(SECOND, start_time, IFNULL(stop_time, CURRENT_TIMESTAMP))) as time_spent_new FROM `task_history` GROUP BY taskID) as b ON tasks.ID = b.taskID
            WHERE tasks.ID = $ID";
  $result = mysqli_query($db, $sql);
  $old = mysqli_fetch_assoc($result);


  $changes = array();
  if(strcmp($new->Name, $old["Name"]) != 0){
    // print("Name: ".$new->title." - ".$old["Name"]." => ".strcmp($new->title, $old["Name"]));
    array_push($changes, "`Name` = '".$new->Name."'");
  }
  if(strcmp($new->description, $old["description"]) != 0){
    array_push($changes, "`description` = '".$new->description."'");
  }
  if(strcmp($new->due, $old["due"]) != 0){
    array_push($changes, "`due` = '".$new->due."'");
  }
  if(strcmp($new->due_time, $old["due_time"]) != 0){
    array_push($changes, "`due_time` = '".$new->due_time."'");
  }
  if(strcmp($new->duration, $old["duration"]) != 0){
    array_push($changes, "`duration` = '".$new->duration."'");
  }
  if(strcmp($new->category, $old["category"]) != 0){
    array_push($changes, "`category` = '".$new->category."'");
  }
  if(strcmp($new->priority, $old["priority"]) != 0){
    array_push($changes, "`priority` = '".$new->priority."'");
  }
  if(strcmp($new->location, $old["location"]) != 0){
    array_push($changes, "`location` = '".$new->location."'");
  }
  if(strcmp($new->deleted, $old["deleted"]) != 0){
    array_push($changes, "`deleted` = '".$new->deleted."'");
  }
  if(strcmp($new->difficulty, $old["difficulty"]) != 0){
    array_push($changes, "`difficulty` = '".$new->difficulty."'");
  }


  $changes_string = implode(",", $changes);

  $sql = "UPDATE `tasks` SET $changes_string WHERE `tasks`.`ID` = '$ID'";
  mysqli_query($db, $sql);
}



header('Content-Type: application/json');

print '{"status": "done", "sql": "'.$sql.'", "old": '.json_encode($old).'}';
?>
