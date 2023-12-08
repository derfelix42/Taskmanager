<?php

$globals["database_name"] = "j_tasks";
require_once("../includes/db_connection.php");

$db = $globals['db'];
$sql = "";

if (isset($_GET['ID'])) {

  $ID = $_GET['ID'];
  $date = $_GET['date'];

  $sql = "SELECT * FROM habits_tracker WHERE habitID = $ID AND DATE(done) = '$date'";
  $result = mysqli_query($db, $sql);
  if (mysqli_num_rows($result) > 0) {
    // Delete entry
    $sql = "DELETE FROM `habits_tracker` WHERE habitID = $ID AND DATE(done) = '$date'";
  } else {
    // Insert new entry
    $sql = "INSERT INTO `habits_tracker`(`habitID`, `done`) VALUES ('$ID','$date')";
  }
  
  mysqli_query($db, $sql);
  header('Content-Type: application/json');
  
  print '{"status": "done", "sql": "' . $sql . '"}';
} else {
  $sql = "SELECT habits.ID, habits.name, habits.type, GROUP_CONCAT(DATE(done)) AS dates FROM `habits` LEFT JOIN habits_tracker ON habits.ID = habits_tracker.habitID WHERE habits.active = 1 GROUP BY habits.ID;";
  $result = mysqli_query($db, $sql);

  $rows = array();
  while ($row = mysqli_fetch_assoc($result)) {
    $id = $row['ID'];
    $name = $row['name'];
    $type = $row['type'];
    $dates = explode(",", $row['dates']);
    $rows[] = ["id" => $id, "name" => $name, "type" => $type, "dates" => $dates];
  }

  header('Content-Type: application/json');

  print json_encode($rows);

}



?>