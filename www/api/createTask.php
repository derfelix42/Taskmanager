<?php

$globals["database_name"] = "j_tasks";
require_once("../includes/db_connection.php");

$db = $globals['db'];

$body = json_decode(file_get_contents('php://input'));

if(isset($body->title)) {
  $name = $body->title;
  $desc = $body->description;
  $duedate  = $body->due;
  $duetime  = $body->due_time != "" ? "'".$body->due_time."'" : "NULL";
  $duration  = $body->duration != "" ? "'".$body->duration."'" : "NULL";
  $priority  = $body->priority;
  $category  = $body->category;
  $location  = $body->location;

  $sql = "INSERT INTO `tasks` (`ID`, `Name`, `description`, `due`, `due_time`, `done`, `duration`, `priority`, `category`, `location`) VALUES (NULL, '$name', '$desc', '$duedate', $duetime, NULL, $duration, '$priority', '$category', '$location');";
  // echo $sql; exit();
  mysqli_query($db, $sql);
  $res = mysqli_query($db, "SELECT LAST_INSERT_ID() as ID;");
  $row = mysqli_fetch_assoc($res);

  print('{"status": "unkown", "body": '.json_encode($body).', "sql": "'.$sql.'", "result": '.json_encode($row).'}');



  exit();
}
?>
