<?php

$globals["database_name"] = "j_tasks";
require_once("../includes/db_connection.php");

$db = $globals['db'];


if(isset($_GET['title'])) {
  $name = htmlentities($_GET['title']);
  $desc = "";
  if(isset($_GET['description'])) {
    $desc = htmlentities($_GET['description']);
  }
  $duedate = "'".$_GET['due']."'";
  $duetime = (!empty($_GET['duetime']) ? "'".$_GET['duetime']."'": "NULL");
  $duration = (!empty($_GET['duration']) ? "'".$_GET['duration']."'": "NULL");
  $priority = $_GET['priority'];
  $category = $_GET['category'];
  $location = "";
  if(isset($_GET['location'])) {
    $location = $_GET['location'];
  }
  $sql = "INSERT INTO `tasks` (`ID`, `Name`, `description`, `due`, `due_time`, `done`, `duration`, `priority`, `category`, `location`) VALUES (NULL, '$name', '$desc', $duedate, $duetime, NULL, $duration, '$priority', '$category', '$location');";
  // echo $sql; exit();
  mysqli_query($db, $sql);
  $res = mysqli_query($db, "SELECT LAST_INSERT_ID() as ID;");
  $row = mysqli_fetch_assoc($res);

  print_r(json_encode($row));



  exit();
}

?>
